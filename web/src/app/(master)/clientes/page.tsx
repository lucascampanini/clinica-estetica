'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Cake, Phone, Mail, Check, Sun, Star, ShoppingBag } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CLINICA_ID = process.env.NEXT_PUBLIC_CLINICA_ID ?? '';

export default function ClientesPage() {
  const { usuario, carregando: authCarregando } = useAuth();
  const [clientes,   setClientes]   = useState<any[]>([]);
  const [busca,      setBusca]      = useState('');
  const [carregando, setCarregando] = useState(true);
  const [copiado,    setCopiado]    = useState<string | null>(null);

  function copiarLink(clienteId: string, tipo: 'rotina' | 'avaliar' | 'vitrine') {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const url = tipo === 'vitrine'
      ? `${base}/c/${CLINICA_ID}/vitrine`
      : `${base}/c/${CLINICA_ID}/${tipo}/${clienteId}`;
    navigator.clipboard.writeText(url);
    const key = `${clienteId}-${tipo}`;
    setCopiado(key);
    setTimeout(() => setCopiado(k => k === key ? null : k), 2000);
  }

  const carregar = useCallback(async (texto: string) => {
    if (!usuario) return;
    setCarregando(true);
    try {
      const params = texto ? `?busca=${encodeURIComponent(texto)}` : '';
      const res = await api.get(`/clientes/${usuario.clinicaId}${params}`);
      setClientes(res.data);
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => { carregar(''); }, [carregar]);

  // Debounce da busca
  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 350);
    return () => clearTimeout(t);
  }, [busca, carregar]);

  if (authCarregando) return null;

  const hoje = new Date();
  const ehAniversariante = (d?: string) => {
    if (!d) return false;
    const dt = new Date(d);
    return dt.getMonth() === hoje.getMonth() && dt.getDate() === hoje.getDate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Badge variant="outline">{clientes.length} encontrado{clientes.length !== 1 ? 's' : ''}</Badge>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou e-mail…"
          className="pl-9"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {carregando ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : clientes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum cliente encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {clientes.map(c => {
            const aniversariante = ehAniversariante(c.dataNascimento);
            const idade = c.dataNascimento
              ? differenceInYears(hoje, new Date(c.dataNascimento))
              : null;

            return (
              <Card key={c.id} className={aniversariante ? 'border-rose-300 bg-rose-50' : ''}>
                <CardContent className="py-3 flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-rose-100 text-rose-700 font-semibold">
                      {c.nome.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{c.nome}</p>
                      {aniversariante && (
                        <Badge className="bg-rose-100 text-rose-700 border-rose-300 text-xs gap-1">
                          <Cake size={10} /> Aniversário hoje!
                        </Badge>
                      )}
                      {!c.ativo && <Badge variant="outline" className="text-xs">Inativo</Badge>}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Phone size={11} />{c.telefone}</span>
                      {c.email && <span className="flex items-center gap-1"><Mail size={11} />{c.email}</span>}
                      {idade !== null && (
                        <span className="flex items-center gap-1">
                          <Cake size={11} />
                          {format(new Date(c.dataNascimento), 'd MMM yyyy', { locale: ptBR })} · {idade} anos
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {(['rotina', 'avaliar', 'vitrine'] as const).map(tipo => {
                        const copied = copiado === `${c.id}-${tipo}`;
                        const labels = { rotina: 'Rotina', avaliar: 'Avaliação', vitrine: 'Vitrine' };
                        const icons  = { rotina: <Sun size={11} />, avaliar: <Star size={11} />, vitrine: <ShoppingBag size={11} /> };
                        return (
                          <Button
                            key={tipo}
                            variant="outline"
                            size="sm"
                            className={`h-6 px-2 text-xs gap-1 transition-colors ${copied ? 'border-green-400 text-green-600' : 'text-muted-foreground'}`}
                            onClick={() => copiarLink(c.id, tipo)}
                          >
                            {copied ? <Check size={11} /> : icons[tipo]}
                            {copied ? 'Copiado!' : labels[tipo]}
                          </Button>
                        );
                      })}
                    </div>
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
