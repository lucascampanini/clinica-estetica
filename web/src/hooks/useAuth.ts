'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsuario, UsuarioLogado } from '@/lib/auth';

export function useAuth() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const u = getUsuario();
    if (!u) {
      router.replace('/login');
    } else {
      setUsuario(u);
    }
    setCarregando(false);
  }, [router]);

  return { usuario, carregando };
}
