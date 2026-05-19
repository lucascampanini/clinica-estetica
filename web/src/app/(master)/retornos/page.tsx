'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RetornosPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const [retornos,   setRetornos]   = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    if (!usuario) return;
    setCarregando(true);
    try {
      const res = await api.get(`/retornos/pendentes/${usuario.clinicaId}`);
      setRetornos(res.data);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, [usuario]);

  async function atualizarStatus(id: string, status: string) {
    try {
      await api.patch(`/retornos/${id}/status`, { status });
      toast.success('Status atualizado.');
      carregar();
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Erro.');
    }
  }

  if (authCarregando) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Retornos pendentes</h1>

      {carregando ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : retornos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum retorno pendente.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {retornos.map(r => {
            const diasRestantes = differenceInDays(new Date(r.dataRetorno), new Date());
            const urgente       = diasRestantes <= 3;
            return (
              <Card key={r.id} className={urgente ? 'border-amber-300' : ''}>
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {format(new Date(r.dataRetorno), "d 'de' MMMM", { locale: ptBR })}
                      <span className={`ml-2 text-xs ${urgente ? 'text-amber-600 font-semibold' : 'text-muted-foreground'}`}>
                        ({diasRestantes === 0 ? 'hoje' : `em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}`})
                      </span>
                    </p>
                    {r.observacao && <p className="text-xs text-muted-foreground">{r.observacao}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => atualizarStatus(r.id, 'AGENDADO')}>
                      Agendado
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600"
                      onClick={() => atualizarStatus(r.id, 'CANCELADO')}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
