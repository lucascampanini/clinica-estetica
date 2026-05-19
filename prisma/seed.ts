import '../src/config/env';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clínica
  const clinica = await prisma.clinica.upsert({
    where:  { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      nome:     'Clínica Beleza & Estética',
      cnpj:     '00.000.000/0001-00',
      telefone: '(11) 99999-0000',
      email:    'contato@clinica.com',
      endereco: 'Rua das Flores, 100 — São Paulo/SP',
    },
  });
  console.log('✓ Clínica:', clinica.id);

  // Admin
  const admin = await prisma.usuario.upsert({
    where:  { clinicaId_email: { clinicaId: clinica.id, email: 'admin@clinica.com' } },
    update: {},
    create: {
      clinicaId: clinica.id,
      nome:      'Administradora',
      email:     'admin@clinica.com',
      senhaHash: await bcrypt.hash('123456', 10),
      perfil:    'ADMIN',
    },
  });
  console.log('✓ Admin:', admin.email);

  // Profissional
  const prof = await prisma.profissional.upsert({
    where:  { id: 'prof-seed-001' },
    update: {},
    create: {
      id:           'prof-seed-001',
      clinicaId:    clinica.id,
      nome:         'Ana Lima',
      especialidade: 'Esteticista',
      telefone:     '(11) 98888-1111',
    },
  });
  console.log('✓ Profissional:', prof.nome);

  // Disponibilidade (seg-sex 9h-18h)
  await prisma.disponibilidadeProfissional.deleteMany({ where: { profissionalId: prof.id } });
  for (const dia of [1, 2, 3, 4, 5]) {
    await prisma.disponibilidadeProfissional.create({
      data: { profissionalId: prof.id, diaSemana: dia, horaInicio: '09:00', horaFim: '18:00' },
    });
  }

  // Serviços
  const servicos = [
    { nome: 'Limpeza de Pele',        duracaoMinutos: 60,  preco: 120 },
    { nome: 'Peeling Químico',        duracaoMinutos: 45,  preco: 150 },
    { nome: 'Design de Sobrancelha',  duracaoMinutos: 30,  preco:  60 },
    { nome: 'Drenagem Linfática',     duracaoMinutos: 90,  preco: 180 },
  ];
  for (const s of servicos) {
    await prisma.servico.upsert({
      where:  { id: `svc-${s.nome.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: { id: `svc-${s.nome.replace(/\s+/g, '-').toLowerCase()}`, clinicaId: clinica.id, ...s },
    });
  }
  console.log('✓ 4 serviços criados');

  // Cliente
  const cliente = await prisma.cliente.upsert({
    where:  { clinicaId_telefone: { clinicaId: clinica.id, telefone: '(11) 97777-2222' } },
    update: {},
    create: {
      clinicaId:      clinica.id,
      nome:           'Maria Silva',
      telefone:       '(11) 97777-2222',
      email:          'maria@exemplo.com',
      dataNascimento: new Date('1990-05-19'), // aniversário HOJE para testar
    },
  });
  console.log('✓ Cliente:', cliente.nome);

  // Produto vitrine
  await prisma.produtoVitrine.upsert({
    where:  { id: 'prod-seed-001' },
    update: {},
    create: {
      id:           'prod-seed-001',
      clinicaId:    clinica.id,
      nome:         'Sérum Vitamina C 30ml',
      descricao:    'Clareador e antioxidante para uso diário. Resultados visíveis em 2 semanas.',
      preco:        89.90,
      categoria:    'Skincare',
      linkParceiro: 'https://example.com/afiliado?ref=clinica',
      destaque:     true,
    },
  });
  console.log('✓ Produto vitrine criado');

  // Avaliação de exemplo
  await prisma.avaliacaoAtendimento.create({
    data: {
      clinicaId:  clinica.id,
      clienteId:  cliente.id,
      nota:       5,
      comentario: 'Atendimento incrível, super satisfeita!',
      servico:    'Limpeza de Pele',
    },
  }).catch(() => {}); // ignora duplicata

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌸 Seed concluído!');
  console.log(`   CLÍNICA ID : ${clinica.id}`);
  console.log(`   LOGIN      : admin@clinica.com`);
  console.log(`   SENHA      : 123456`);
  console.log(`   CLIENTE ID : ${cliente.id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
