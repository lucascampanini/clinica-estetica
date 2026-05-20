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

export interface AnamneseInput {
  tipoPele?:    string;
  queixas?:     string[];
  usaProtetor?: boolean;
  medicamentos?: string;
  alergias?:    string;
  gestante?:    boolean;
  observacoes?: string;
  lgpdConsent:  boolean;
}

export interface CriarClienteInput {
  clinicaId:       string;
  nome:            string;
  telefone:        string;
  email?:          string;
  cpf?:            string;
  dataNascimento?: string;
  observacoes?:    string;
  anamnese?:       AnamneseInput;
}

export interface IClienteRepository {
  criar(input: CriarClienteInput): Promise<{ id: string }>;
  buscarAniversariantesHoje(clinicaId: UniqueEntityID): Promise<ClienteAniversariante[]>;
  listar(clinicaId: UniqueEntityID, busca?: string): Promise<ClienteResumo[]>;
}
