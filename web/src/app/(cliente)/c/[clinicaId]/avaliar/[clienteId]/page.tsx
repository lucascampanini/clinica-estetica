'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';
import { use } from 'react';

const schema = z.object({
  comentario: z.string().optional(),
  servico:    z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AvaliarPage({ params }: { params: Promise<{ clinicaId: string; clienteId: string }> }) {
  const { clinicaId, clienteId } = use(params);
  const [nota,      setNota]      = useState(0);
  const [hover,     setHover]     = useState(0);
  const [enviado,   setEnviado]   = useState(false);
  const [enviando,  setEnviando]  = useState(false);

  const { register, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    if (nota === 0) { toast.error('Selecione uma nota.'); return; }
    setEnviando(true);
    try {
      await api.post('/avaliacoes', {
        clinicaId,
        clienteId,
        nota,
        comentario: data.comentario || undefined,
        servico:    data.servico    || undefined,
      });
      setEnviado(true);
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Erro ao enviar avaliação.');
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-5xl">💖</p>
        <h1 className="text-2xl font-bold text-rose-700">Obrigada!</h1>
        <p className="text-muted-foreground">Sua avaliação foi enviada com sucesso.</p>
      </div>
    );
  }

  const estrelaAtiva = hover || nota;
  const LABELS = ['', 'Muito insatisfeita 😞', 'Insatisfeita 😕', 'Neutro 😐', 'Satisfeita 😊', 'Muito satisfeita 😍'];

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-1">
        <p className="text-3xl">⭐</p>
        <h1 className="text-2xl font-bold text-rose-700">Avalie seu atendimento</h1>
        <p className="text-sm text-muted-foreground">Sua opinião é muito importante!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Estrelas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 text-center space-y-4">
          <p className="text-sm font-medium">Como foi seu atendimento?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setNota(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={36}
                  className={n <= estrelaAtiva
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-200'}
                />
              </button>
            ))}
          </div>
          {estrelaAtiva > 0 && (
            <p className="text-sm font-medium text-rose-600 animate-in fade-in">
              {LABELS[estrelaAtiva]}
            </p>
          )}
        </div>

        {/* Campos opcionais */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="servico">Serviço realizado <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Input id="servico" placeholder="Ex: Limpeza de pele, design de sobrancelha…" {...register('servico')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comentario">Comentário <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <textarea
              id="comentario"
              {...register('comentario')}
              rows={3}
              placeholder="Conte como foi sua experiência…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-rose-600 hover:bg-rose-700 h-12 text-base rounded-xl"
          disabled={enviando || nota === 0}
        >
          {enviando ? 'Enviando…' : 'Enviar avaliação'}
        </Button>
      </form>
    </div>
  );
}
