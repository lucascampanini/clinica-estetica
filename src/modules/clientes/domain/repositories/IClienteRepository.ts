import { UniqueEntityID } from '@shared/domain/UniqueEntityID';

export interface ClienteAniversariante {
  id:            string;
  nome:          string;
  telefone:      string;
  email?:        string;
  dataNascimento: Date;
  idade:          number;
}

export interface ClienteResumo {
  id:             string;
  nome:           string;
  telefone:       string;
  email?:         string;
  dataNascimento?: Date;
  ativo:          boolean;
  criadoEm:      Date;
}

export interface IClienteRepository {
  buscarAniversariantesHoje(clinicaId: UniqueEntityID): Promise<ClienteAniversariante[]>;
  listar(clinicaId: UniqueEntityID, busca?: string): Promise<ClienteResumo[]>;
}
