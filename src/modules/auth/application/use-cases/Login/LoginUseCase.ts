import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Result } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { prisma } from '@infra/database/prisma';
import { env } from '@config/env';

interface Input {
  email:     string;
  senha:     string;
  clinicaId: string;
}

interface Output {
  token:     string;
  expiresIn: string;
  usuario: {
    id:        string;
    nome:      string;
    email:     string;
    perfil:    string;
    clinicaId: string;
  };
}

export class LoginUseCase {
  async executar(input: Input): Promise<Result<Output>> {
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: input.email,     argumentName: 'email' },
      { argument: input.senha,     argumentName: 'senha' },
      { argument: input.clinicaId, argumentName: 'clinicaId' },
    ]);
    if (!guard.succeeded) return Result.fail(guard.message!);

    const usuario = await prisma.usuario.findFirst({
      where: { clinicaId: input.clinicaId, email: input.email.toLowerCase().trim(), ativo: true },
    });

    if (!usuario) return Result.fail('Credenciais inválidas.');

    const senhaCorreta = await bcrypt.compare(input.senha, usuario.senhaHash);
    if (!senhaCorreta) return Result.fail('Credenciais inválidas.');

    const payload = {
      sub:       usuario.id,
      clinicaId: usuario.clinicaId,
      perfil:    usuario.perfil,
      nome:      usuario.nome,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

    return Result.ok({
      token,
      expiresIn: env.JWT_EXPIRES_IN,
      usuario: {
        id:        usuario.id,
        nome:      usuario.nome,
        email:     usuario.email,
        perfil:    usuario.perfil,
        clinicaId: usuario.clinicaId,
      },
    });
  }
}
