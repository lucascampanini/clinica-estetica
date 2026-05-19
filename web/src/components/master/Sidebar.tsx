'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { limparSessao, getUsuario } from '@/lib/auth';
import {
  LayoutDashboard, CalendarDays, Users, DollarSign,
  Star, ShoppingBag, MessageSquare, RefreshCw, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const nav = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/agendamentos', label: 'Agendamentos', icon: CalendarDays },
  { href: '/clientes',     label: 'Clientes',     icon: Users },
  { href: '/financeiro',   label: 'Financeiro',   icon: DollarSign },
  { href: '/rotinas',      label: 'Rotinas',      icon: Star },
  { href: '/vitrine',      label: 'Vitrine',      icon: ShoppingBag },
  { href: '/avaliacoes',   label: 'Avaliações',   icon: MessageSquare },
  { href: '/retornos',     label: 'Retornos',     icon: RefreshCw },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const usuario  = getUsuario();

  function sair() {
    limparSessao();
    router.replace('/login');
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <p className="text-lg font-bold text-rose-600">✨ Clínica Estética</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{usuario?.nome}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-rose-50 text-rose-700'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={sair}>
          <LogOut size={18} />
          Sair
        </Button>
      </div>
    </aside>
  );
}
