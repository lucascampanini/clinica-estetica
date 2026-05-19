import { Request, Response } from 'express';
import { LoginUseCase } from '../../../application/use-cases/Login/LoginUseCase';
import { CriarUsuarioUseCase } from '../../../application/use-cases/CriarUsuario/CriarUsuarioUseCase';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const useCase = new LoginUseCase();
    const result  = await useCase.executar(req.body);
    if (result.isFailure) { res.status(401).json({ error: result.getErrorValue() }); return; }
    res.status(200).json(result.getValue());
  }

  async criarUsuario(req: Request, res: Response): Promise<void> {
    const useCase = new CriarUsuarioUseCase();
    const result  = await useCase.executar(req.body);
    if (result.isFailure) { res.status(422).json({ error: result.getErrorValue() }); return; }
    res.status(201).json(result.getValue());
  }
}
