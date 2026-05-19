'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

function Estrelas({ nota }: { nota: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < nota ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
      ))}
    </div>
  );
}

export default function AvaliacoesPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const [nps,       setNps]       = useState<any>(null);
  const [recentes,  setRecentes]  = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    Promise.all([
      api.get(`/avaliacoes/nps/${usuario.clinicaId}`),
      api.get(`/avaliacoes/recentes/${usuario.clinicaId}?limite=20`),
    ]).then(([npsRes, recentesRes]) => {
      setNps(npsRes.data);
      setRecentes(recentesRes.data);
    }).finally(() => setCarregando(false));
  }, [usuario]);

  if (authCarregando) return null;

  const categoriaColor = (c: string) =>
    c === 'PROMOTOR' ? 'default' : c === 'NEUTRO' ? 'secondary' : 'destructive';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Avaliações</h1>

      {carregando ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <>
          {/* NPS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">NPS (90 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-700">{nps?.nps ?? '—'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Média</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{nps?.mediaNota ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{nps?.total ?? 0} avaliações</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Promotores ⭐⭐⭐⭐⭐</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-700">{nps?.promotores ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Detratores ⭐⭐</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{nps?.detratores ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Últimas avaliações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Últimas avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              {recentes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda.</p>
              ) : (
                <div className="space-y-3">
                  {recentes.map(a => (
                    <div key={a.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Estrelas nota={a.nota} />
                          <Badge variant={categoriaColor(a.categoria)} className="text-xs">
                            {a.categoria}
                          </Badge>
                        </div>
                        {a.comentario && <p className="text-sm text-muted-foreground">"{a.comentario}"</p>}
                        {a.servico    && <p className="text-xs text-muted-foreground">Serviço: {a.servico}</p>}
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(a.criadoEm).toLocaleDateString('pt-BR')}
                      </p>
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
