import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { AvaliacaoAtendimento } from '../entities/AvaliacaoAtendimento';

export interface ResumoNPS {
  total:      number;
  promotores: number;
  neutros:    number;
  detratores: number;
  nps:        number; // ((promotores - detratores) / total) * 100
  mediaNota:  number;
}

export interface IAvaliacaoRepository {
  salvar(avaliacao: AvaliacaoAtendimento): Promise<void>;
  calcularNPS(clinicaId: UniqueEntityID, diasAtras?: number): Promise<ResumoNPS>;
  listarRecentes(clinicaId: UniqueEntityID, limite: number): Promise<AvaliacaoAtendimento[]>;
}
