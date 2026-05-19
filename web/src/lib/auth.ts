'use client';

export interface UsuarioLogado {
  id:        string;
  nome:      string;
  email:     string;
  perfil:    'ADMIN' | 'PROFISSIONAL' | 'RECEPCIONISTA';
  clinicaId: string;
}

export function getUsuario(): UsuarioLogado | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('usuario');
  if (!raw) return null;
  try { return JSON.parse(raw) as UsuarioLogado; } catch { return null; }
}

export function salvarSessao(token: string, usuario: UsuarioLogado): void {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function limparSessao(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function estaAutenticado(): boolean {
  return !!localStorage.getItem('token');
}
