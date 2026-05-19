import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IAgendamentoRepository } from '@modules/agendamento/domain/repositories/IAgendamentoRepository';
import { Agendamento } from '@modules/agendamento/domain/entities/Agendamento';

interface PorDiaInput {
  tipo:      'dia';
  clinicaId: string;
  data:      string; // YYYY-MM-DD
}

interface PorClienteInput {
  tipo:      'cliente';
  clienteId: string;
}

interface PorProfissionalInput {
  tipo:           'profissional';
  profissionalId: string;
  data:           string;
}

type Input = PorDiaInput | PorClienteInput | PorProfissionalInput;

export class ListarAgendamentosUseCase {
  constructor(private readonly repo: IAgendamentoRepository) {}

  async executar(input: Input): Promise<Result<Agendamento[]>> {
    let lista: Agendamento[];

    if (input.tipo === 'dia') {
      lista = await this.repo.listarPorDia(
        new UniqueEntityID(input.clinicaId),
        new Date(input.data),
      );
    } else if (input.tipo === 'cliente') {
      lista = await this.repo.listarPorCliente(new UniqueEntityID(input.clienteId));
    } else {
      lista = await this.repo.listarPorProfissional(
        new UniqueEntityID(input.profissionalId),
        new Date(input.data),
      );
    }

    return Result.ok(lista);
  }
}
