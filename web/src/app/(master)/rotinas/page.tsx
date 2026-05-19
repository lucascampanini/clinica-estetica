'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function RotinasPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const [clientes,   setClientes]   = useState<any[]>([]);
  const [busca,      setBusca]      = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async (texto: string) => {
    if (!usuario) return;
    setCarregando(true);
    try {
      const params = texto ? `?busca=${encodeURIComponent(texto)}` : '';
      const res = await api.get(`/clientes/${usuario.clinicaId}${params}`);
      setClientes(res.data.filter((c: any) => c.ativo));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rotinas</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Selecione uma cliente para ver e gerenciar a rotina dela.
      </p>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente…"
          className="pl-9"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {carregando ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : clientes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma cliente encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {clientes.map(c => (
            <Link key={c.id} href={`/rotinas/${c.id}`}>
              <Card className="hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{c.telefone}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
