import { PrismaClient } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IRotinaRepository } from '../../domain/repositories/IRotinaRepository';
import { Rotina } from '../../domain/entities/Rotina';
import { PassoRotina } from '../../domain/entities/PassoRotina';
import { PeriodoRotina } from '../../domain/enums/PeriodoRotina';
import { HorarioSugerido } from '../../domain/value-objects/HorarioSugerido';

export class RotinaRepositoryPrisma implements IRotinaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorId(id: UniqueEntityID): Promise<Rotina | null> {
    const raw = await this.prisma.rotina.findUnique({
      where: { id: id.toString() },
      include: { passos: { where: { ativo: true }, orderBy: { ordem: 'asc' } } },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async buscarAtivasPorCliente(clienteId: UniqueEntityID): Promise<Rotina[]> {
    const raws = await this.prisma.rotina.findMany({
      where: { clienteId: clienteId.toString(), ativa: true },
      include: { passos: { where: { ativo: true }, orderBy: { ordem: 'asc' } } },
    });
    return raws.map(r => this.toDomain(r));
  }

  async buscarPorClinica(clinicaId: UniqueEntityID): Promise<Rotina[]> {
    const raws = await this.prisma.rotina.findMany({
      where: { clinicaId: clinicaId.toString() },
      include: { passos: { where: { ativo: true }, orderBy: { ordem: 'asc' } } },
    });
    return raws.map(r => this.toDomain(r));
  }

  async salvar(rotina: Rotina): Promise<void> {
    await this.prisma.rotina.create({
      data: {
        id:             rotina.id.toString(),
        clinicaId:      rotina.clinicaId.toString(),
        clienteId:      rotina.clienteId.toString(),
        profissionalId: rotina.profissionalId.toString(),
        nome:           rotina.nome,
        descricao:      rotina.descricao,
        ativa:          rotina.ativa,
        passos: {
          create: rotina.passos.map(p => ({
            id:              p.id.toString(),
            nome:            p.nome,
            produto:         p.produto,
            instrucoes:      p.instrucoes,
            periodo:         p.periodo,
            horarioSugerido: p.horarioSugerido?.valor,
            diasSemana:      p.diasSemana,
            ordem:           p.ordem,
            ativo:           p.ativo,
          })),
        },
      },
    });
  }

  async atualizar(rotina: Rotina): Promise<void> {
    await this.prisma.rotina.update({
      where: { id: rotina.id.toString() },
      data: {
        nome:      rotina.nome,
        descricao: rotina.descricao,
        ativa:     rotina.ativa,
      },
    });

    for (const passo of rotina.passos) {
      await this.prisma.passoRotina.upsert({
        where: { id: passo.id.toString() },
        create: {
          id:              passo.id.toString(),
          rotinaId:        rotina.id.toString(),
          nome:            passo.nome,
          produto:         passo.produto,
          instrucoes:      passo.instrucoes,
          periodo:         passo.periodo,
          horarioSugerido: passo.horarioSugerido?.valor,
          diasSemana:      passo.diasSemana,
          ordem:           passo.ordem,
          ativo:           passo.ativo,
        },
        update: { ativo: passo.ativo },
      });
    }
  }

  private toDomain(raw: any): Rotina {
    const rotinaOrError = Rotina.criar(
      {
        clinicaId:      new UniqueEntityID(raw.clinicaId),
        clienteId:      new UniqueEntityID(raw.clienteId),
        profissionalId: new UniqueEntityID(raw.profissionalId),
        nome:           raw.nome,
        descricao:      raw.descricao ?? undefined,
      },
      new UniqueEntityID(raw.id),
    );

    const rotina = rotinaOrError.getValue();
    // Limpa os eventos gerados no reconstitution
    rotina.clearEvents();

    for (const p of raw.passos ?? []) {
      let horarioSugerido: HorarioSugerido | undefined;
      if (p.horarioSugerido) {
        const h = HorarioSugerido.criar(p.horarioSugerido);
        if (h.isSuccess) horarioSugerido = h.getValue();
      }

      const passoOrError = PassoRotina.criar(
        {
          rotinaId:       new UniqueEntityID(p.rotinaId),
          nome:           p.nome,
          produto:        p.produto ?? undefined,
          instrucoes:     p.instrucoes ?? undefined,
          periodo:        p.periodo as PeriodoRotina,
          horarioSugerido,
          diasSemana:     p.diasSemana,
          ordem:          p.ordem,
        },
        new UniqueEntityID(p.id),
      );

      if (passoOrError.isSuccess) {
        rotina.adicionarPasso(passoOrError.getValue());
      }
    }

    return rotina;
  }
}
