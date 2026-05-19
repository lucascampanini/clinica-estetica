'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, MousePointerClick } from 'lucide-react';

export default function VitrinePage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const [produtos,   setProdutos]   = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    api.get(`/vitrine/master/${usuario.clinicaId}`)
      .then(res => setProdutos(res.data))
      .finally(() => setCarregando(false));
  }, [usuario]);

  if (authCarregando) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vitrine de produtos</h1>
      </div>

      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : produtos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ShoppingBag className="mx-auto mb-3 text-gray-300" size={40} />
            Nenhum produto cadastrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {produtos.map(p => (
            <Card key={p.id} className={p.destaque ? 'border-rose-300 shadow-md' : ''}>
              {p.imagemUrl && (
                <img src={p.imagemUrl} alt={p.nome} className="w-full h-40 object-cover rounded-t-lg" />
              )}
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-tight">{p.nome}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    {p.destaque && <Badge className="bg-rose-100 text-rose-700 text-xs">Destaque</Badge>}
                    {!p.ativo   && <Badge variant="outline" className="text-xs">Inativo</Badge>}
                  </div>
                </div>
                {p.descricao  && <p className="text-xs text-muted-foreground line-clamp-2">{p.descricao}</p>}
                {p.preco      && <p className="text-sm font-bold text-rose-600">
                  {Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MousePointerClick size={12} />
                  {p.totalCliques ?? 0} cliques
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
