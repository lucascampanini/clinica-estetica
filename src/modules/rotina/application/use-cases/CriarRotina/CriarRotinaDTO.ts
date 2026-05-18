export interface PassoRotinaInputDTO {
  nome: string;
  produto?: string;
  instrucoes?: string;
  periodo: 'MANHA' | 'TARDE' | 'NOITE' | 'QUALQUER';
  horarioSugerido?: string;  // "HH:MM"
  diasSemana?: number[];     // vazio = todos os dias
  ordem?: number;
}

export interface CriarRotinaDTO {
  clinicaId: string;
  clienteId: string;
  profissionalId: string;
  nome: string;
  descricao?: string;
  passos: PassoRotinaInputDTO[];
}
