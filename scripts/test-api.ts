import '../src/config/env';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const BASE        = 'http://localhost:3000/api/v1';
const CLINICA_ID  = 'e44dd286-5b11-4507-b633-d79cc18441d5';
const CLIENTE_ID  = 'c006f072-6e7d-407e-be37-f2121ef7fba8';
const PROF_ID     = 'prof-seed-001';

const http = axios.create({ baseURL: BASE });
let ok = 0; let fail = 0;

async function check(label: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${label}`);
    ok++;
  } catch (e: any) {
    const msg = e.response?.data?.error ?? e.message;
    console.log(`  ✗ ${label} — ${msg}`);
    fail++;
  }
}

async function limparDadosTeste() {
  const prisma = new PrismaClient();
  try {
    // Remove cobranças e agendamentos de teste para permitir re-execução
    const amanha = new Date(); amanha.setDate(amanha.getDate() + 1);
    const inicio = new Date(amanha); inicio.setHours(10, 0, 0, 0);
    const fim    = new Date(amanha); fim.setHours(11, 0, 0, 0);

    const ags = await prisma.agendamento.findMany({
      where: { profissionalId: PROF_ID, inicio: { gte: inicio }, fim: { lte: fim } },
    });
    for (const ag of ags) {
      await prisma.cobranca.deleteMany({ where: { agendamentoId: ag.id } });
    }
    await prisma.agendamento.deleteMany({
      where: { profissionalId: PROF_ID, inicio: { gte: inicio }, fim: { lte: fim } },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await limparDadosTeste();
  console.log('\n🧪 Testando API...\n');

  // ── AUTH ──────────────────────────────────────────────────────────────────
  console.log('Auth');
  let token = '';
  await check('POST /auth/login — credenciais corretas', async () => {
    const res = await http.post('/auth/login', {
      clinicaId: CLINICA_ID, email: 'admin@clinica.com', senha: '123456',
    });
    token = res.data.token;
    if (!token) throw new Error('token vazio');
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  });
  await check('POST /auth/login — credenciais erradas → 401', async () => {
    try { await http.post('/auth/login', { clinicaId: CLINICA_ID, email: 'x@x.com', senha: 'errada' }); throw new Error('deveria ter dado 401'); }
    catch (e: any) { if (e.response?.status !== 401) throw e; }
  });

  // ── CATÁLOGO ──────────────────────────────────────────────────────────────
  console.log('\nCatálogo');
  let servicoId = '';
  await check('GET /catalogo/:clinicaId — lista serviços', async () => {
    const res = await http.get(`/catalogo/${CLINICA_ID}`);
    if (!res.data.length) throw new Error('lista vazia');
    servicoId = res.data[0].id;
  });
  await check('POST /catalogo — cria serviço', async () => {
    const res = await http.post('/catalogo', {
      clinicaId: CLINICA_ID, nome: 'Serviço Teste', duracaoMinutos: 30, preco: 99,
    });
    if (!res.data.id) throw new Error('sem id');
    // limpa
    await http.delete(`/catalogo/${res.data.id}`);
  });

  // ── PROFISSIONAIS ─────────────────────────────────────────────────────────
  console.log('\nProfissionais');
  await check('GET /profissionais/:clinicaId', async () => {
    const res = await http.get(`/profissionais/${CLINICA_ID}`);
    if (!res.data.length) throw new Error('lista vazia');
  });
  await check('PUT /profissionais/:id/disponibilidade', async () => {
    await http.put(`/profissionais/${PROF_ID}/disponibilidade`, {
      disponibilidades: [{ diaSemana: 1, horaInicio: '09:00', horaFim: '18:00' }],
    });
  });

  // ── CLIENTES ──────────────────────────────────────────────────────────────
  console.log('\nClientes');
  await check('GET /clientes/:clinicaId', async () => {
    const res = await http.get(`/clientes/${CLINICA_ID}`);
    if (!res.data.length) throw new Error('lista vazia');
  });
  await check('GET /clientes/:clinicaId?busca=maria', async () => {
    const res = await http.get(`/clientes/${CLINICA_ID}?busca=maria`);
    if (!res.data.length) throw new Error('busca retornou vazio');
  });
  await check('GET /clientes/aniversariantes-hoje/:clinicaId', async () => {
    const res = await http.get(`/clientes/aniversariantes-hoje/${CLINICA_ID}`);
    // Maria tem aniversário hoje (19/05), deve aparecer
    if (!res.data.length) throw new Error('deveria ter aniversariante hoje');
  });

  // ── AGENDAMENTOS ──────────────────────────────────────────────────────────
  console.log('\nAgendamentos');
  let agendamentoId = '';
  const amanha = new Date(); amanha.setDate(amanha.getDate() + 1);
  const inicio  = new Date(amanha); inicio.setHours(10, 0, 0, 0);
  const fim     = new Date(amanha); fim.setHours(11, 0, 0, 0);

  await check('POST /agendamentos — cria agendamento', async () => {
    const res = await http.post('/agendamentos', {
      clinicaId: CLINICA_ID, clienteId: CLIENTE_ID,
      profissionalId: PROF_ID, servicoId,
      inicio: inicio.toISOString(), fim: fim.toISOString(),
    });
    agendamentoId = res.data.id;
    if (!agendamentoId) throw new Error('sem id');
  });
  await check('POST /agendamentos — conflito de horário → 422', async () => {
    try {
      await http.post('/agendamentos', {
        clinicaId: CLINICA_ID, clienteId: CLIENTE_ID,
        profissionalId: PROF_ID, servicoId,
        inicio: inicio.toISOString(), fim: fim.toISOString(),
      });
      throw new Error('deveria ter dado 422');
    } catch (e: any) { if (e.response?.status !== 422) throw e; }
  });
  await check('PATCH /agendamentos/:id/status — confirmar', async () => {
    await http.patch(`/agendamentos/${agendamentoId}/status`, { status: 'CONFIRMADO' });
  });
  await check('PATCH /agendamentos/:id/status — concluir', async () => {
    await http.patch(`/agendamentos/${agendamentoId}/status`, { status: 'CONCLUIDO' });
  });
  await check('PATCH /agendamentos/:id/status — bloqueado (terminal) → 422', async () => {
    try {
      await http.patch(`/agendamentos/${agendamentoId}/status`, { status: 'CANCELADO' });
      throw new Error('deveria bloquear');
    } catch (e: any) { if (e.response?.status !== 422) throw e; }
  });

  // ── FINANCEIRO ────────────────────────────────────────────────────────────
  console.log('\nFinanceiro');
  let cobrancaId = '';
  await check('POST /financeiro/cobrancas', async () => {
    const res = await http.post('/financeiro/cobrancas', {
      clinicaId: CLINICA_ID, agendamentoId,
      valor: 120, formaPagamento: 'PIX',
    });
    cobrancaId = res.data.id;
  });
  await check('POST /financeiro/cobrancas — duplicata → 422', async () => {
    try {
      await http.post('/financeiro/cobrancas', {
        clinicaId: CLINICA_ID, agendamentoId, valor: 120, formaPagamento: 'PIX',
      });
      throw new Error('deveria bloquear duplicata');
    } catch (e: any) { if (e.response?.status !== 422) throw e; }
  });
  await check('PATCH /financeiro/cobrancas/:id/pagar', async () => {
    await http.patch(`/financeiro/cobrancas/${cobrancaId}/pagar`, { formaPagamento: 'PIX' });
  });
  await check('GET /financeiro/relatorio/:clinicaId', async () => {
    const res = await http.get(`/financeiro/relatorio/${CLINICA_ID}?de=2026-01-01&ate=2026-12-31`);
    if (res.data.totalReceita <= 0) throw new Error('receita zerada após pagamento');
  });

  // ── AVALIAÇÕES ────────────────────────────────────────────────────────────
  console.log('\nAvaliações');
  await check('POST /avaliacoes', async () => {
    await http.post('/avaliacoes', {
      clinicaId: CLINICA_ID, clienteId: CLIENTE_ID, nota: 5,
      comentario: 'Teste de avaliação', servico: 'Limpeza de Pele',
    });
  });
  await check('GET /avaliacoes/nps/:clinicaId', async () => {
    const res = await http.get(`/avaliacoes/nps/${CLINICA_ID}`);
    if (res.data.total < 1) throw new Error('NPS vazio');
  });
  await check('GET /avaliacoes/recentes/:clinicaId', async () => {
    const res = await http.get(`/avaliacoes/recentes/${CLINICA_ID}`);
    if (!res.data.length) throw new Error('recentes vazio');
  });

  // ── RETORNOS ──────────────────────────────────────────────────────────────
  console.log('\nRetornos');
  let retornoId = '';
  const dataRetorno = new Date(); dataRetorno.setDate(dataRetorno.getDate() + 14);
  await check('POST /retornos', async () => {
    const res = await http.post('/retornos', {
      clinicaId: CLINICA_ID, clienteId: CLIENTE_ID, profissionalId: PROF_ID,
      dataRetorno: dataRetorno.toISOString(), observacao: 'Retorno de acompanhamento',
    });
    retornoId = res.data.id;
  });
  await check('GET /retornos/pendentes/:clinicaId', async () => {
    const res = await http.get(`/retornos/pendentes/${CLINICA_ID}`);
    if (!res.data.length) throw new Error('lista vazia');
  });
  await check('PATCH /retornos/:id/status — AGENDADO', async () => {
    await http.patch(`/retornos/${retornoId}/status`, { status: 'AGENDADO' });
  });

  // ── VITRINE ───────────────────────────────────────────────────────────────
  console.log('\nVitrine');
  await check('GET /vitrine/:clinicaId — pública', async () => {
    const res = await http.get(`/vitrine/${CLINICA_ID}`);
    if (!res.data.length) throw new Error('vitrine vazia');
  });
  await check('GET /vitrine/master/:clinicaId — master', async () => {
    const res = await http.get(`/vitrine/master/${CLINICA_ID}`);
    if (!res.data.length) throw new Error('master vazia');
  });

  // ── RESULTADO ─────────────────────────────────────────────────────────────
  console.log(`\n${'━'.repeat(40)}`);
  console.log(`✅  ${ok} testes passaram`);
  if (fail) console.log(`❌  ${fail} falharam`);
  console.log('━'.repeat(40));
  if (fail) process.exit(1);
}

run().catch(e => { console.error(e); process.exit(1); });
