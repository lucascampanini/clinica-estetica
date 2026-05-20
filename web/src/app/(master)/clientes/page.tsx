'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, Cake, Phone, Mail, Check, Sun, Star, ShoppingBag, UserPlus } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CLINICA_ID = process.env.NEXT_PUBLIC_CLINICA_ID ?? '';

const QUEIXAS = ['Acne', 'Manchas', 'Rugas', 'Flacidez', 'Olheiras', 'Poros dilatados', 'Sensibilidade'];

const schema = z.object({
  nome:           z.string().min(2, 'Nome obrigatório'),
  telefone:       z.string().min(8, 'Telefone obrigatório'),
  email:          z.string().email('E-mail inválido').optional().or(z.literal('')),
  dataNascimento: z.string().optional(),
  observacoes:    z.string().optional(),
  tipoPele:       z.string().optional(),
  queixas:        z.array(z.string()).optional(),
  usaProtetor:    z.boolean().optional(),
  medicamentos:   z.string().optional(),
  alergias:       z.string().optional(),
  gestante:       z.boolean().optional(),
  anamneseObs:    z.string().optional(),
  lgpdConsent:    z.boolean().refine(v => v === true, 'Consentimento obrigatório'),
});
type FormData = z.infer<typeof schema>;

export default function ClientesPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const [clientes,   setClientes]   = useState<any[]>([]);
  const [busca,      setBusca]      = useState('');
  const [carregando, setCarregando] = useState(true);
  const [copiado,    setCopiado]    = useState<string | null>(null);
  const [abrirForm,  setAbrirForm]  = useState(false);
  const [salvando,   setSalvando]   = useState(false);
  const [erroForm,   setErroForm]   = useState('');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { queixas: [] },
  });

  const queixasSel = watch('queixas') ?? [];

  function toggleQueixa(q: string) {
    const atual = watch('queixas') ?? [];
    setValue('queixas', atual.includes(q) ? atual.filter(x => x !== q) : [...atual, q]);
  }

  async function onSubmit(data: FormData) {
    setErroForm('');
    setSalvando(true);
    try {
      await api.post('/clientes', {
        clinicaId:       usuario?.clinicaId ?? CLINICA_ID,
        nome:            data.nome,
        telefone:        data.telefone,
        email:           data.email || undefined,
        dataNascimento:  data.dataNascimento || undefined,
        observacoes:     data.observacoes || undefined,
        anamnese: {
          tipoPele:    data.tipoPele,
          queixas:     data.queixas,
          usaProtetor: data.usaProtetor,
          medicamentos: data.medicamentos || undefined,
          alergias:    data.alergias || undefined,
          gestante:    data.gestante,
          observacoes: data.anamneseObs || undefined,
          lgpdConsent: data.lgpdConsent,
        },
      });
      reset();
      setAbrirForm(false);
      carregar('');
    } catch (e: any) {
      setErroForm(e.response?.data?.error ?? 'Erro ao cadastrar cliente.');
    } finally {
      setSalvando(false);
    }
  }

  function copiarLink(clienteId: string, tipo: 'rotina' | 'avaliar' | 'vitrine') {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const url = tipo === 'vitrine'
      ? `${base}/c/${CLINICA_ID}/vitrine`
      : `${base}/c/${CLINICA_ID}/${tipo}/${clienteId}`;
    navigator.clipboard.writeText(url);
    const key = `${clienteId}-${tipo}`;
    setCopiado(key);
    setTimeout(() => setCopiado(k => k === key ? null : k), 2000);
  }

  const carregar = useCallback(async (texto: string) => {
    if (!usuario) return;
    setCarregando(true);
    try {
      const params = texto ? `?busca=${encodeURIComponent(texto)}` : '';
      const res = await api.get(`/clientes/${usuario.clinicaId}${params}`);
      setClientes(res.data);
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => { carregar(''); }, [carregar]);
  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 350);
    return () => clearTimeout(t);
  }, [busca, carregar]);

  if (authCarregando) return null;

  const hoje = new Date();
  const ehAniversariante = (d?: string) => {
    if (!d) return false;
    const dt = new Date(d);
    return dt.getMonth() === hoje.getMonth() && dt.getDate() === hoje.getDate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{clientes.length} encontrado{clientes.length !== 1 ? 's' : ''}</Badge>
          <Button size="sm" className="bg-rose-600 hover:bg-rose-700 gap-1" onClick={() => { reset(); setErroForm(''); setAbrirForm(true); }}>
            <UserPlus size={15} /> Nova cliente
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nome, telefone ou e-mail…" className="pl-9" value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {carregando ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : clientes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum cliente encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {clientes.map(c => {
            const aniversariante = ehAniversariante(c.dataNascimento);
            const idade = c.dataNascimento ? differenceInYears(hoje, new Date(c.dataNascimento)) : null;

            return (
              <Card key={c.id} className={aniversariante ? 'border-rose-300 bg-rose-50' : ''}>
                <CardContent className="py-3 flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-rose-100 text-rose-700 font-semibold">
                      {c.nome.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{c.nome}</p>
                      {aniversariante && (
                        <Badge className="bg-rose-100 text-rose-700 border-rose-300 text-xs gap-1">
                          <Cake size={10} /> Aniversário hoje!
                        </Badge>
                      )}
                      {!c.ativo && <Badge variant="outline" className="text-xs">Inativo</Badge>}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Phone size={11} />{c.telefone}</span>
                      {c.email && <span className="flex items-center gap-1"><Mail size={11} />{c.email}</span>}
                      {idade !== null && (
                        <span className="flex items-center gap-1">
                          <Cake size={11} />
                          {format(new Date(c.dataNascimento), 'd MMM yyyy', { locale: ptBR })} · {idade} anos
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {(['rotina', 'avaliar', 'vitrine'] as const).map(tipo => {
                        const copied = copiado === `${c.id}-${tipo}`;
                        const labels = { rotina: 'Rotina', avaliar: 'Avaliação', vitrine: 'Vitrine' };
                        const icons  = { rotina: <Sun size={11} />, avaliar: <Star size={11} />, vitrine: <ShoppingBag size={11} /> };
                        return (
                          <Button key={tipo} variant="outline" size="sm"
                            className={`h-6 px-2 text-xs gap-1 transition-colors ${copied ? 'border-green-400 text-green-600' : 'text-muted-foreground'}`}
                            onClick={() => copiarLink(c.id, tipo)}>
                            {copied ? <Check size={11} /> : icons[tipo]}
                            {copied ? 'Copiado!' : labels[tipo]}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sheet de cadastro */}
      <Sheet open={abrirForm} onOpenChange={setAbrirForm}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Nova cliente</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-8">

            {/* ── Dados pessoais ── */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dados pessoais</p>

              <div className="space-y-1">
                <Label>Nome completo *</Label>
                <Input placeholder="Maria Silva" {...register('nome')} />
                {errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Telefone / WhatsApp *</Label>
                <Input placeholder="(11) 99999-9999" {...register('telefone')} />
                {errors.telefone && <p className="text-xs text-red-500">{errors.telefone.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>E-mail</Label>
                <Input type="email" placeholder="maria@email.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Data de nascimento</Label>
                <Input type="date" {...register('dataNascimento')} />
              </div>

              <div className="space-y-1">
                <Label>Observações gerais</Label>
                <textarea
                  rows={2}
                  placeholder="Preferências, como chegou até a clínica…"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  {...register('observacoes')}
                />
              </div>
            </section>

            <hr />

            {/* ── Ficha de anamnese ── */}
            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ficha de anamnese</p>

              <div className="space-y-2">
                <Label>Tipo de pele</Label>
                <div className="flex flex-wrap gap-2">
                  {['Seca', 'Oleosa', 'Mista', 'Normal', 'Sensível'].map(tp => (
                    <label key={tp} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" value={tp} {...register('tipoPele')} className="accent-rose-600" />
                      <span className="text-sm">{tp}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Principais queixas</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {QUEIXAS.map(q => (
                    <label key={q} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={queixasSel.includes(q)}
                        onChange={() => toggleQueixa(q)}
                        className="accent-rose-600"
                      />
                      <span className="text-sm">{q}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Usa protetor solar diariamente?</Label>
                <div className="flex gap-4">
                  {[{ label: 'Sim', val: true }, { label: 'Não', val: false }].map(({ label, val }) => (
                    <label key={label} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" onChange={() => setValue('usaProtetor', val)} name="usaProtetor" className="accent-rose-600" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Usa medicamentos? Se sim, quais</Label>
                <Input placeholder="Antibiótico, anticoncepcional…" {...register('medicamentos')} />
              </div>

              <div className="space-y-1">
                <Label>Tem alergias? Se sim, quais</Label>
                <Input placeholder="Látex, iodo, retinol…" {...register('alergias')} />
              </div>

              <div className="space-y-2">
                <Label>Gestante ou amamentando?</Label>
                <div className="flex gap-4">
                  {[{ label: 'Sim', val: true }, { label: 'Não', val: false }].map(({ label, val }) => (
                    <label key={label} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" onChange={() => setValue('gestante', val)} name="gestante" className="accent-rose-600" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Observações da profissional</Label>
                <textarea
                  rows={2}
                  placeholder="Notas clínicas, contraindicações…"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  {...register('anamneseObs')}
                />
              </div>
            </section>

            <hr />

            {/* ── LGPD ── */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" {...register('lgpdConsent')} className="accent-rose-600 mt-0.5" />
              <span className="text-xs text-muted-foreground">
                Autorizo o uso dos meus dados pessoais e de saúde para fins de acompanhamento estético, conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
              </span>
            </label>
            {errors.lgpdConsent && <p className="text-xs text-red-500">{errors.lgpdConsent.message}</p>}

            {erroForm && <p className="text-sm text-red-600 text-center">{erroForm}</p>}

            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={salvando}>
              {salvando ? 'Cadastrando…' : 'Cadastrar cliente'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
