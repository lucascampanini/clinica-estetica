import bcrypt from 'bcryptjs';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { prisma } from '@infra/database/prisma';
import { PerfilUsuario } from '@prisma/client';

interface Input {
  clinicaId: string;
  nome:      string;
  email:     string;
  senha:     string;
  perfil:    PerfilUsuario;
}

interface Output {
  id:    string;
  nome:  string;
  email: string;
  perfil: PerfilUsuario;
}

export class CriarUsuarioUseCase {
  async executar(input: Input): Promise<Result<Output>> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: input.clinicaId, argumentName: 'clinicaId' },
      { argument: input.nome,      argumentName: 'nome' },
      { argument: input.email,     argumentName: 'email' },
      { argument: input.senha,     argumentName: 'senha' },
      { argument: input.perfil,    argumentName: 'perfil' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    if (input.senha.length < 6) return Result.fail('A senha deve ter no mínimo 6 caracteres.');

    const perfisValidos: PerfilUsuario[] = ['ADMIN', 'PROFISSIONAL', 'RECEPCIONISTA'];
    if (!perfisValidos.includes(input.perfil)) {
      return Result.fail(`Perfil inválido: ${input.perfil}`);
    }

    const existente = await prisma.usuario.findFirst({
      where: { clinicaId: input.clinicaId, email: input.email.toLowerCase().trim() },
    });
    if (existente) return Result.fail('Já existe um usuário com este e-mail nesta clínica.');

    const senhaHash = await bcrypt.hash(input.senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        clinicaId: input.clinicaId,
        nome:      input.nome.trim(),
        email:     input.email.toLowerCase().trim(),
        senhaHash,
        perfil:    input.perfil,
      },
    });

    return Result.ok({
      id:     usuario.id,
      nome:   usuario.nome,
      email:  usuario.email,
      perfil: usuario.perfil,
    });
  }
}
