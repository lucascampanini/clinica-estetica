import { UniqueEntityID } from '@shared/domain/UniqueEntityID';

export interface ClienteAniversariante {
  id:            string;
  nome:          string;
  telefone:      string;
  email?:        string;
  dataNascimento: Date;
  idade:          number;
}

export interface IClienteRepository {
  buscarAniversariantesHoje(clinicaId: UniqueEntityID): Promise<ClienteAniversariante[]>;
}
