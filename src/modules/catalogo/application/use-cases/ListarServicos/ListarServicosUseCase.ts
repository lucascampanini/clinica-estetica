import { Result } from '@shared/core/Result';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IServicoRepository } from '@modules/catalogo/domain/repositories/IServicoRepository';
import { Servico } from '@modules/catalogo/domain/entities/Servico';

interface Input {
  clinicaId:    string;
  apenasAtivos?: boolean;
}

export class ListarServicosUseCase {
  constructor(private readonly repo: IServicoRepository) {}

  async executar(input: Input): Promise<Result<Servico[]>> {
    const servicos = await this.repo.listar(
      new UniqueEntityID(input.clinicaId),
      input.apenasAtivos ?? true,
    );
    return Result.ok(servicos);
  }
}
