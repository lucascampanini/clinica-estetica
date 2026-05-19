import { Entity } from '@shared/domain/Entity';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

interface ServicoProps {
  clinicaId:       UniqueEntityID;
  nome:            string;
  descricao?:      string;
  duracaoMinutos:  number;
  preco:           number;
  ativo:           boolean;
}

export class Servico extends Entity<ServicoProps> {
  get clinicaId()      { return this.props.clinicaId; }
  get nome()           { return this.props.nome; }
  get descricao()      { return this.props.descricao; }
  get duracaoMinutos() { return this.props.duracaoMinutos; }
  get preco()          { return this.props.preco; }
  get ativo()          { return this.props.ativo; }

  atualizar(campos: Partial<Pick<ServicoProps, 'nome' | 'descricao' | 'duracaoMinutos' | 'preco'>>): void {
    if (campos.nome !== undefined)           this.props.nome           = campos.nome;
    if (campos.descricao !== undefined)      this.props.descricao      = campos.descricao;
    if (campos.duracaoMinutos !== undefined) this.props.duracaoMinutos = campos.duracaoMinutos;
    if (campos.preco !== undefined)          this.props.preco          = campos.preco;
  }

  desativar(): void { this.props.ativo = false; }
  ativar():    void { this.props.ativo = true; }

  static criar(
    props: Omit<ServicoProps, 'ativo'>,
    id?: UniqueEntityID,
  ): Result<Servico> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: props.clinicaId,      argumentName: 'clinicaId' },
      { argument: props.nome,           argumentName: 'nome' },
      { argument: props.duracaoMinutos, argumentName: 'duracaoMinutos' },
      { argument: props.preco,          argumentName: 'preco' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    if (props.duracaoMinutos <= 0) return Result.fail('Duração deve ser maior que zero.');
    if (props.preco < 0)           return Result.fail('Preço não pode ser negativo.');

    return Result.ok(new Servico({ ...props, ativo: true }, id));
  }

  static reconstituir(props: ServicoProps, id: UniqueEntityID): Servico {
    return new Servico(props, id);
  }
}
