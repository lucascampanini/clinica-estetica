'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function FinanceiroPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const [de,  setDe]  = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [ate, setAte] = useState(format(endOfMonth(new Date()),   'yyyy-MM-dd'));
  const [relatorio,  setRelatorio]  = useState<any>(null);
  const [cobranças,  setCobranças]  = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    if (!usuario) return;
    setCarregando(true);
    try {
      const [rel, cob] = await Promise.all([
        api.get(`/financeiro/relatorio/${usuario.clinicaId}?de=${de}&ate=${ate}`),
        api.get(`/financeiro/cobrancas/${usuario.clinicaId}?de=${de}&ate=${ate}`),
      ]);
      setRelatorio(rel.data);
      setCobranças(cob.data);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, [usuario, de, ate]);

  if (authCarregando) return null;

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financeiro</h1>

      {/* Filtro de período */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm">De</span>
          <Input type="date" value={de}  onChange={e => setDe(e.target.value)}  className="w-40" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Até</span>
          <Input type="date" value={ate} onChange={e => setAte(e.target.value)} className="w-40" />
        </div>
        <Button variant="outline" onClick={carregar}>Filtrar</Button>
      </div>

      {carregando ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Receita recebida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-700">{fmt(relatorio?.totalReceita ?? 0)}</p>
                <p className="text-xs text-muted-foreground">{relatorio?.quantidadePago ?? 0} pagamentos</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">A receber</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-700">{fmt(relatorio?.totalPendente ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Por forma de pagamento</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {Object.entries(relatorio?.porFormaPagamento ?? {}).map(([forma, valor]) => (
                  <div key={forma} className="text-xs">
                    <span className="font-medium">{forma}:</span> {fmt(valor as number)}
                  </div>
                ))}
                {Object.keys(relatorio?.porFormaPagamento ?? {}).length === 0 && (
                  <p className="text-xs text-muted-foreground">Sem dados</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lista de cobranças */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cobranças do período</CardTitle>
            </CardHeader>
            <CardContent>
              {cobranças.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma cobrança no período.</p>
              ) : (
                <div className="space-y-2">
                  {cobranças.map(c => (
                    <div key={c.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <span>{fmt(c.valor)}</span>
                      <span className="text-muted-foreground">{c.formaPagamento}</span>
                      <Badge variant={c.status === 'PAGO' ? 'default' : c.status === 'CANCELADO' ? 'destructive' : 'outline'}>
                        {c.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
