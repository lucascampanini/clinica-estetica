'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { use } from 'react';
import { CheckCircle2, Circle, Sun, Sunset, Moon, Infinity, Star, Flame } from 'lucide-react';

const PERIODO_ICON: Record<string, any> = {
  MANHA: Sun, TARDE: Sunset, NOITE: Moon, QUALQUER: Infinity,
};
const PERIODO_LABEL: Record<string, string> = {
  MANHA: 'Manhã', TARDE: 'Tarde', NOITE: 'Noite', QUALQUER: 'Qualquer hora',
};

export default function RotinaDoDiaPage({ params }: { params: Promise<{ clinicaId: string; clienteId: string }> }) {
  const { clienteId } = use(params);
  const [dados,      setDados]      = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [concluindo, setConcluindo] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await api.get(`/rotinas/hoje/${clienteId}`);
      setDados(res.data);
    } catch {
      setDados(null);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, [clienteId]);

  async function concluirPasso(registroId: string, passoId: string, jaConcluido: boolean) {
    if (jaConcluido) return;
    setConcluindo(passoId);
    try {
      await api.patch(`/rotinas/registros/${registroId}/passos/${passoId}`);
      toast.success('Passo concluído! ✨');
      await carregar();
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Erro ao salvar.');
    } finally {
      setConcluindo(null);
    }
  }

  if (carregando) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-rose-100 rounded-full w-48 mx-auto" />
          <div className="h-32 bg-white rounded-2xl" />
          <div className="h-32 bg-white rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!dados || !dados.registro) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-5xl">🌸</p>
        <h1 className="text-xl font-bold text-rose-700">Nenhuma rotina para hoje</h1>
        <p className="text-muted-foreground text-sm">Sua esteticista ainda não configurou sua rotina.</p>
      </div>
    );
  }

  const { rotina, registro, pontuacao } = dados;
  const checklist: any[] = registro.checklist ?? [];
  const concluidos = checklist.filter(i => i.concluido).length;
  const total      = checklist.length;
  const percentual = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  const gruposPorPeriodo = checklist.reduce((acc: any, item: any) => {
    const p = item.passo?.periodo ?? 'QUALQUER';
    if (!acc[p]) acc[p] = [];
    acc[p].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="text-3xl">🌸</p>
        <h1 className="text-2xl font-bold text-rose-700">{rotina.nome}</h1>
        <p className="text-sm text-muted-foreground">Rotina de hoje</p>
      </div>

      {/* Progresso */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{concluidos} de {total} passos</span>
          <span className="font-bold text-rose-600">{percentual}%</span>
        </div>
        <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${percentual}%` }}
          />
        </div>
        {percentual === 100 && (
          <p className="text-center text-sm font-medium text-rose-600 animate-bounce">
            Parabéns! Rotina completa! 🎉
          </p>
        )}
      </div>

      {/* Pontuação */}
      {pontuacao && (
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-rose-100 flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-amber-500">{pontuacao.estrelasTotal}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
              <Star size={10} className="fill-amber-400 text-amber-400" /> estrelas
            </p>
          </div>
          <div className="w-px bg-rose-100" />
          <div>
            <p className="text-2xl font-bold text-orange-500">{pontuacao.streakAtual}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
              <Flame size={10} className="text-orange-400" /> dias seguidos
            </p>
          </div>
          <div className="w-px bg-rose-100" />
          <div>
            <p className="text-2xl font-bold text-rose-600">{pontuacao.streakMaximo}</p>
            <p className="text-xs text-muted-foreground">recorde 🏆</p>
          </div>
        </div>
      )}

      {/* Checklist por período */}
      <div className="space-y-4">
        {(Object.entries(gruposPorPeriodo) as [string, any[]][]).map(([periodo, itens]) => {
          const Icon = PERIODO_ICON[periodo] ?? Infinity;
          return (
            <div key={periodo}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Icon size={14} className="text-rose-400" />
                <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                  {PERIODO_LABEL[periodo]}
                </p>
              </div>
              <div className="space-y-2">
                {itens.map((item: any) => (
                  <button
                    key={item.passoRotinaId}
                    onClick={() => concluirPasso(registro.id, item.passoRotinaId, item.concluido)}
                    disabled={item.concluido || concluindo === item.passoRotinaId}
                    className={`w-full text-left bg-white rounded-2xl p-4 shadow-sm border transition-all
                      ${item.concluido
                        ? 'border-emerald-200 bg-emerald-50 opacity-80'
                        : 'border-rose-100 hover:border-rose-300 hover:shadow active:scale-[0.98]'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {item.concluido
                        ? <CheckCircle2 size={22} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        : <Circle size={22} className="text-rose-200 flex-shrink-0 mt-0.5" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${item.concluido ? 'line-through text-muted-foreground' : ''}`}>
                          {item.passo?.nome}
                        </p>
                        {item.passo?.produto && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.passo.produto}</p>
                        )}
                        {item.passo?.instrucoes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.passo.instrucoes}</p>
                        )}
                      </div>
                      {item.passo?.horarioSugerido && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">{item.passo.horarioSugerido}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
