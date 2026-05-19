'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star, Clock, Sun, Sunset, Moon, Infinity } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

const PERIODO_ICON: Record<string, any> = {
  MANHA: Sun, TARDE: Sunset, NOITE: Moon, QUALQUER: Infinity,
};
const PERIODO_LABEL: Record<string, string> = {
  MANHA: 'Manhã', TARDE: 'Tarde', NOITE: 'Noite', QUALQUER: 'Qualquer hora',
};

export default function RotinaClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clienteId } = use(params);
  const { usuario, carregando: authCarregando } = useAuth();
  const [rotinas,    setRotinas]    = useState<any[]>([]);
  const [evolucao,   setEvolucao]   = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [clienteNome, setClienteNome] = useState('');

  useEffect(() => {
    if (!usuario) return;
    Promise.all([
      api.get(`/rotinas/cliente/${clienteId}`),
      api.get(`/clientes/${usuario.clinicaId}?busca=`).catch(() => ({ data: [] })),
    ]).then(([rotRes, cliRes]) => {
      setRotinas(rotRes.data);
      const cliente = cliRes.data.find((c: any) => c.id === clienteId);
      if (cliente) setClienteNome(cliente.nome);
      // Pega evolução da primeira rotina ativa se houver
      if (rotRes.data.length > 0) {
        api.get(`/rotinas/${rotRes.data[0].id}/evolucao`)
          .then(ev => setEvolucao(ev.data))
          .catch(() => {});
      }
    }).finally(() => setCarregando(false));
  }, [usuario, clienteId]);

  if (authCarregando) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/rotinas" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{clienteNome || 'Cliente'}</h1>
          <p className="text-sm text-muted-foreground">Gerenciar rotina</p>
        </div>
      </div>

      {/* Evolução / gamificação */}
      {evolucao && (
        <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
          <CardContent className="py-4 flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-rose-600">{evolucao.pontuacao?.estrelasTotal ?? 0}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                <Star size={11} className="fill-amber-400 text-amber-400" /> estrelas totais
              </p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <p className="text-3xl font-bold text-rose-600">{evolucao.pontuacao?.streakAtual ?? 0}</p>
              <p className="text-xs text-muted-foreground">dias seguidos 🔥</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <p className="text-3xl font-bold text-rose-600">{evolucao.pontuacao?.streakMaximo ?? 0}</p>
              <p className="text-xs text-muted-foreground">melhor sequência</p>
            </div>
          </CardContent>
        </Card>
      )}

      {carregando ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : rotinas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma rotina cadastrada para esta cliente.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rotinas.map((r: any) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{r.nome}</CardTitle>
                  <Badge variant={r.ativa ? 'default' : 'outline'}>
                    {r.ativa ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                {r.descricao && <p className="text-sm text-muted-foreground">{r.descricao}</p>}
              </CardHeader>
              <CardContent>
                {r.passos?.length > 0 ? (
                  <ul className="space-y-2">
                    {r.passos.map((p: any) => {
                      const Icon = PERIODO_ICON[p.periodo] ?? Clock;
                      return (
                        <li key={p.id} className="flex items-start gap-3 text-sm border-b pb-2 last:border-0">
                          <Icon size={14} className="mt-0.5 text-rose-500 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="font-medium">{p.nome}</span>
                            {p.produto && <span className="text-muted-foreground"> — {p.produto}</span>}
                            {p.instrucoes && <p className="text-xs text-muted-foreground">{p.instrucoes}</p>}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Badge variant="outline" className="text-xs">{PERIODO_LABEL[p.periodo]}</Badge>
                            {p.horarioSugerido && (
                              <Badge variant="outline" className="text-xs">
                                <Clock size={10} className="mr-1" />{p.horarioSugerido}
                              </Badge>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum passo cadastrado.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
