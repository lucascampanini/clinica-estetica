'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { use } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export default function VitrineClientePage({ params }: { params: Promise<{ clinicaId: string }> }) {
  const { clinicaId } = use(params);
  const [produtos,   setProdutos]   = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get(`/vitrine/${clinicaId}`)
      .then(res => setProdutos(res.data))
      .finally(() => setCarregando(false));
  }, [clinicaId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <p className="text-3xl">✨</p>
        <h1 className="text-2xl font-bold text-rose-700">Produtos Recomendados</h1>
        <p className="text-sm text-muted-foreground">Selecionados especialmente para você</p>
      </div>

      {carregando ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag size={40} className="mx-auto mb-3 text-rose-200" />
          <p>Nenhum produto disponível no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {produtos.map(p => (
            <a
              key={p.id}
              href={`${BASE_URL}/vitrine/${p.id}/ir`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-white shadow-sm border border-rose-100 overflow-hidden hover:shadow-md hover:border-rose-300 transition-all active:scale-[0.99]"
            >
              {p.imagemUrl && (
                <img src={p.imagemUrl} alt={p.nome} className="w-full h-48 object-cover" />
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{p.nome}</p>
                    {p.categoria && (
                      <Badge variant="outline" className="text-xs mt-1 border-rose-200 text-rose-600">
                        {p.categoria}
                      </Badge>
                    )}
                  </div>
                  {p.destaque && (
                    <Badge className="bg-rose-500 text-white text-xs flex-shrink-0">Destaque ⭐</Badge>
                  )}
                </div>
                {p.descricao && <p className="text-sm text-muted-foreground line-clamp-2">{p.descricao}</p>}
                <div className="flex items-center justify-between pt-1">
                  {p.preco ? (
                    <p className="text-lg font-bold text-rose-600">
                      {Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  ) : <span />}
                  <span className="flex items-center gap-1 text-sm font-medium text-rose-600">
                    Comprar <ExternalLink size={14} />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
