'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado', NAO_COMPARECEU: 'Não compareceu',
};

const STATUS_VARIANT: Record<string, any> = {
  PENDENTE: 'outline', CONFIRMADO: 'default',
  CONCLUIDO: 'secondary', CANCELADO: 'destructive', NAO_COMPARECEU: 'destructive',
};

const ACOES: Record<string, { label: string; novoStatus: string }[]> = {
  PENDENTE:   [{ label: 'Confirmar', novoStatus: 'CONFIRMADO' }, { label: 'Cancelar', novoStatus: 'CANCELADO' }],
  CONFIRMADO: [{ label: 'Concluir', novoStatus: 'CONCLUIDO' }, { label: 'Não compareceu', novoStatus: 'NAO_COMPARECEU' }, { label: 'Cancelar', novoStatus: 'CANCELADO' }],
};

export default function AgendamentosPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const [data, setData]                         = useState(new Date());
  const [agendamentos, setAgendamentos]         = useState<any[]>([]);
  const [carregando, setCarregando]             = useState(true);

  const dataStr = format(data, 'yyyy-MM-dd');

  async function carregar() {
    if (!usuario) return;
    setCarregando(true);
    try {
      const res = await api.get(`/agendamentos/dia/${usuario.clinicaId}?data=${dataStr}`);
      setAgendamentos(res.data);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, [usuario, dataStr]);

  async function atualizarStatus(id: string, status: string) {
    try {
      await api.patch(`/agendamentos/${id}/status`, { status });
      toast.success('Status atualizado.');
      carregar();
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Erro ao atualizar.');
    }
  }

  if (authCarregando) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
      </div>

      {/* Navegação de data */}
      <div className="flex items-center gap-3">
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

      {/* Lista */}
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
          {agendamentos.map(a => (
            <Card key={a.id}>
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    {format(new Date(a.inicio), 'HH:mm')} – {format(new Date(a.fim), 'HH:mm')}
                  </p>
                  {a.observacoes && <p className="text-xs text-muted-foreground">{a.observacoes}</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABELS[a.status]}</Badge>
                  {(ACOES[a.status] ?? []).map(acao => (
                    <Button
                      key={acao.novoStatus}
                      size="sm"
                      variant="outline"
                      onClick={() => atualizarStatus(a.id, acao.novoStatus)}
                    >
                      {acao.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
