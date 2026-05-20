'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarPlus, Clock, User, Scissors } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado', NAO_COMPARECEU: 'Não compareceu',
};
const STATUS_COR: Record<string, string> = {
  PENDENTE:       'bg-yellow-100 text-yellow-700 border-yellow-300',
  CONFIRMADO:     'bg-blue-100 text-blue-700 border-blue-300',
  CONCLUIDO:      'bg-green-100 text-green-700 border-green-300',
  CANCELADO:      'bg-red-100 text-red-600 border-red-300',
  NAO_COMPARECEU: 'bg-red-100 text-red-600 border-red-300',
};
const ACOES: Record<string, { label: string; status: string }[]> = {
  PENDENTE:   [{ label: 'Confirmar', status: 'CONFIRMADO' }, { label: 'Cancelar', status: 'CANCELADO' }],
  CONFIRMADO: [{ label: 'Concluir', status: 'CONCLUIDO' }, { label: 'Não compareceu', status: 'NAO_COMPARECEU' }, { label: 'Cancelar', status: 'CANCELADO' }],
};

const schema = z.object({
  clienteId:      z.string().min(1, 'Selecione a cliente'),
  servicoId:      z.string().min(1, 'Selecione o serviço'),
  profissionalId: z.string().min(1, 'Selecione a profissional'),
  data:           z.string().min(1, 'Informe a data'),
  horaInicio:     z.string().min(1, 'Informe o horário'),
  horaFim:        z.string().min(1, 'Informe o horário de término'),
  observacoes:    z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AgendamentosPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const [data,         setData]         = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [carregando,   setCarregando]   = useState(true);
  const [abrirForm,    setAbrirForm]    = useState(false);
  const [salvando,     setSalvando]     = useState(false);

  const [clientes,      setClientes]      = useState<any[]>([]);
  const [servicos,      setServicos]      = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [buscaCliente,  setBuscaCliente]  = useState('');
  const [clienteSel,    setClienteSel]    = useState<any>(null);
  const [mostrarLista,  setMostrarLista]  = useState(false);

  const dataStr = format(data, 'yyyy-MM-dd');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { data: dataStr },
  });

  const servicoIdSel  = watch('servicoId');
  const horaInicioSel = watch('horaInicio');

  // Auto-calcula horário de fim com base na duração do serviço
  useEffect(() => {
    const servico = servicos.find(s => s.id === servicoIdSel);
    if (!servico?.duracaoMinutos || !horaInicioSel) return;
    const [h, m] = horaInicioSel.split(':').map(Number);
    const fim = new Date(0, 0, 0, h, m + servico.duracaoMinutos);
    setValue('horaFim', `${String(fim.getHours()).padStart(2, '0')}:${String(fim.getMinutes()).padStart(2, '0')}`);
  }, [servicoIdSel, horaInicioSel, servicos, setValue]);

  // Busca de clientes com debounce
  useEffect(() => {
    if (!usuario || !abrirForm) return;
    const t = setTimeout(async () => {
      const params = buscaCliente ? `?busca=${encodeURIComponent(buscaCliente)}` : '';
      const res = await api.get(`/clientes/${usuario.clinicaId}${params}`);
      setClientes(res.data.slice(0, 8));
    }, 300);
    return () => clearTimeout(t);
  }, [buscaCliente, usuario, abrirForm]);

  // Carrega serviços e profissionais ao abrir o formulário
  useEffect(() => {
    if (!abrirForm || !usuario) return;
    Promise.all([
      api.get(`/catalogo/${usuario.clinicaId}`),
      api.get(`/profissionais/${usuario.clinicaId}`),
    ]).then(([s, p]) => {
      setServicos(s.data);
      setProfissionais(p.data);
    });
  }, [abrirForm, usuario]);

  const carregar = useCallback(async () => {
    if (!usuario) return;
    setCarregando(true);
    try {
      const res = await api.get(`/agendamentos/dia/${usuario.clinicaId}?data=${dataStr}`);
      setAgendamentos(res.data);
    } finally {
      setCarregando(false);
    }
  }, [usuario, dataStr]);

  useEffect(() => { carregar(); }, [carregar]);

  async function atualizarStatus(id: string, status: string) {
    try {
      await api.patch(`/agendamentos/${id}/status`, { status });
      toast.success('Status atualizado.');
      carregar();
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Erro ao atualizar.');
    }
  }

  async function onSubmit(formData: FormData) {
    setSalvando(true);
    try {
      const inicio = new Date(`${formData.data}T${formData.horaInicio}:00`).toISOString();
      const fim    = new Date(`${formData.data}T${formData.horaFim}:00`).toISOString();
      await api.post('/agendamentos', {
        clinicaId:      usuario?.clinicaId,
        clienteId:      formData.clienteId,
        servicoId:      formData.servicoId,
        profissionalId: formData.profissionalId,
        inicio, fim,
        observacoes: formData.observacoes || undefined,
      });
      toast.success('Agendamento criado!');
      reset({ data: dataStr });
      setClienteSel(null);
      setBuscaCliente('');
      setAbrirForm(false);
      carregar();
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Erro ao agendar.');
    } finally {
      setSalvando(false);
    }
  }

  function abrirNovoForm() {
    reset({ data: dataStr });
    setClienteSel(null);
    setBuscaCliente('');
    setAbrirForm(true);
  }

  if (authCarregando) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
        <Button size="sm" className="bg-rose-600 hover:bg-rose-700 gap-1" onClick={abrirNovoForm}>
          <CalendarPlus size={15} /> Novo agendamento
        </Button>
      </div>

      {/* Navegação de data */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" size="icon" onClick={() => setData(d => subDays(d, 1))}>
          <ChevronLeft size={16} />
        </Button>
        <Input
          type="date"
          value={dataStr}
          onChange={e => setData(new Date(e.target.value + 'T12:00:00'))}
          className="w-44"
        />
        <Button variant="outline" size="icon" onClick={() => setData(d => addDays(d, 1))}>
          <ChevronRight size={16} />
        </Button>
        <span className="text-sm text-muted-foreground capitalize">
          {format(data, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </span>
      </div>

      {/* Lista de agendamentos */}
      {carregando ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : agendamentos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum agendamento para este dia.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {agendamentos.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="py-4 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 mt-0.5">
                    <AvatarFallback className="bg-rose-100 text-rose-700 text-xs font-semibold">
                      {(a.clienteNome ?? '?').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm flex items-center gap-1">
                      <User size={13} className="text-muted-foreground" />
                      {a.clienteNome}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Scissors size={12} /> {a.servicoNome}
                      {a.profissionalNome && <> · <span>{a.profissionalNome}</span></>}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} />
                      {format(new Date(a.inicio), 'HH:mm')} – {format(new Date(a.fim), 'HH:mm')}
                    </p>
                    {a.observacoes && <p className="text-xs text-muted-foreground italic">{a.observacoes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge className={`text-xs border ${STATUS_COR[a.status] ?? ''}`}>
                    {STATUS_LABELS[a.status]}
                  </Badge>
                  {(ACOES[a.status] ?? []).map(acao => (
                    <Button key={acao.status} size="sm" variant="outline"
                      onClick={() => atualizarStatus(a.id, acao.status)}>
                      {acao.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sheet de novo agendamento */}
      <Sheet open={abrirForm} onOpenChange={setAbrirForm}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Novo agendamento</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-8">

            {/* Cliente com busca */}
            <div className="space-y-1 relative">
              <Label>Cliente *</Label>
              {clienteSel ? (
                <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-rose-50 border-rose-200">
                  <span className="text-sm font-medium">{clienteSel.nome}</span>
                  <button type="button" className="text-xs text-muted-foreground underline"
                    onClick={() => { setClienteSel(null); setValue('clienteId', ''); setBuscaCliente(''); }}>
                    trocar
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Buscar pelo nome da cliente…"
                    value={buscaCliente}
                    onChange={e => { setBuscaCliente(e.target.value); setMostrarLista(true); }}
                    onFocus={() => setMostrarLista(true)}
                    autoComplete="off"
                  />
                  {mostrarLista && clientes.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-52 overflow-y-auto">
                      {clientes.map(c => (
                        <button key={c.id} type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-rose-50 flex flex-col"
                          onClick={() => { setClienteSel(c); setValue('clienteId', c.id); setMostrarLista(false); }}>
                          <span className="font-medium">{c.nome}</span>
                          <span className="text-xs text-muted-foreground">{c.telefone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <input type="hidden" {...register('clienteId')} />
              {errors.clienteId && <p className="text-xs text-red-500">{errors.clienteId.message}</p>}
            </div>

            {/* Serviço */}
            <div className="space-y-1">
              <Label>Serviço *</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('servicoId')}
              >
                <option value="">Selecionar serviço…</option>
                {servicos.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nome}{s.duracaoMinutos ? ` (${s.duracaoMinutos}min)` : ''}{s.preco ? ` · R$ ${Number(s.preco).toFixed(2)}` : ''}
                  </option>
                ))}
              </select>
              {errors.servicoId && <p className="text-xs text-red-500">{errors.servicoId.message}</p>}
            </div>

            {/* Profissional */}
            <div className="space-y-1">
              <Label>Profissional *</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('profissionalId')}
              >
                <option value="">Selecionar profissional…</option>
                {profissionais.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              {errors.profissionalId && <p className="text-xs text-red-500">{errors.profissionalId.message}</p>}
            </div>

            {/* Data */}
            <div className="space-y-1">
              <Label>Data *</Label>
              <Input type="date" {...register('data')} />
              {errors.data && <p className="text-xs text-red-500">{errors.data.message}</p>}
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Início *</Label>
                <Input type="time" {...register('horaInicio')} />
                {errors.horaInicio && <p className="text-xs text-red-500">{errors.horaInicio.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Término *</Label>
                <Input type="time" {...register('horaFim')} />
                {errors.horaFim && <p className="text-xs text-red-500">{errors.horaFim.message}</p>}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">O término é preenchido automaticamente pela duração do serviço.</p>

            {/* Observações */}
            <div className="space-y-1">
              <Label>Observações</Label>
              <textarea
                rows={2}
                placeholder="Observações para este atendimento…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                {...register('observacoes')}
              />
            </div>

            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={salvando}>
              {salvando ? 'Agendando…' : 'Criar agendamento'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
