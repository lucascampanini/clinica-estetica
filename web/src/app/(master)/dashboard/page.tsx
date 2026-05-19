'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Star, RefreshCw, Cake } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const [dados, setDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    const hoje = format(new Date(), 'yyyy-MM-dd');

    Promise.all([
      api.get(`/agendamentos/dia/${usuario.clinicaId}?data=${hoje}`),
      api.get(`/financeiro/relatorio/${usuario.clinicaId}?de=${hoje}&ate=${hoje}`),
      api.get(`/avaliacoes/nps/${usuario.clinicaId}`),
      api.get(`/retornos/pendentes/${usuario.clinicaId}`),
      api.get(`/clientes/aniversariantes-hoje/${usuario.clinicaId}`),
    ]).then(([agendamentos, financeiro, nps, retornos, aniversariantes]) => {
      setDados({
        agendamentosHoje:   agendamentos.data,
        receitaHoje:        financeiro.data.totalReceita,
        nps:                nps.data,
        retornosPendentes:  retornos.data,
        aniversariantes:    aniversariantes.data,
      });
    }).finally(() => setCarregando(false));
  }, [usuario]);

  if (authCarregando || carregando) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const hoje = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bom dia, {usuario?.nome?.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground capitalize">{hoje}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos hoje</CardTitle>
            <CalendarDays className="text-rose-500" size={18} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dados?.agendamentosHoje?.length ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita hoje</CardTitle>
            <DollarSign className="text-emerald-500" size={18} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(dados?.receitaHoje ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">NPS (90 dias)</CardTitle>
            <Star className="text-amber-500" size={18} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dados?.nps?.nps ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{dados?.nps?.total ?? 0} avaliações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retornos pendentes</CardTitle>
            <RefreshCw className="text-blue-500" size={18} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dados?.retornosPendentes?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Aniversariantes */}
      {dados?.aniversariantes?.length > 0 && (
        <Card className="border-rose-200 bg-rose-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cake size={16} className="text-rose-500" />
              Aniversariantes de hoje 🎂
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {dados.aniversariantes.map((a: any) => (
              <Badge key={a.id} variant="outline" className="border-rose-300 text-rose-700">
                {a.nome} ({a.idade} anos)
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Agenda do dia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agenda de hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {dados?.agendamentosHoje?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum agendamento para hoje.</p>
          ) : (
            <ul className="space-y-2">
              {dados.agendamentosHoje.map((a: any) => (
                <li key={a.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                  <span>{format(new Date(a.inicio), 'HH:mm')} – {format(new Date(a.fim), 'HH:mm')}</span>
                  <Badge variant={
                    a.status === 'CONFIRMADO'  ? 'default' :
                    a.status === 'CONCLUIDO'   ? 'secondary' :
                    a.status === 'CANCELADO'   ? 'destructive' : 'outline'
                  }>
                    {a.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
