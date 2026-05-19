import { PrismaClient } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IProfissionalRepository } from '../../domain/repositories/IProfissionalRepository';
import { Profissional } from '../../domain/entities/Profissional';

export class ProfissionalRepositoryPrisma implements IProfissionalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async salvar(profissional: Profissional): Promise<void> {
    await this.prisma.profissional.create({
      data: {
        id:           profissional.id.toString(),
        clinicaId:    profissional.clinicaId.toString(),
        nome:         profissional.nome,
        especialidade: profissional.especialidade ?? null,
        telefone:     profissional.telefone ?? null,
        ativo:        profissional.ativo,
      },
    });
  }

  async atualizar(profissional: Profissional): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.profissional.update({
        where: { id: profissional.id.toString() },
        data: {
          nome:          profissional.nome,
          especialidade: profissional.especialidade ?? null,
          telefone:      profissional.telefone ?? null,
          ativo:         profissional.ativo,
        },
      }),
      // Substitui disponibilidades: apaga as antigas e recria
      this.prisma.disponibilidadeProfissional.deleteMany({
        where: { profissionalId: profissional.id.toString() },
      }),
      ...profissional.disponibilidades.map(d =>
        this.prisma.disponibilidadeProfissional.create({
          data: {
            profissionalId: profissional.id.toString(),
            diaSemana:      d.diaSemana,
            horaInicio:     d.horaInicio,
            horaFim:        d.horaFim,
          },
        }),
      ),
    ]);
  }

  async buscarPorId(id: UniqueEntityID): Promise<Profissional | null> {
    const raw = await this.prisma.profissional.findUnique({
      where:   { id: id.toString() },
      include: { disponibilidades: true },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async listar(clinicaId: UniqueEntityID, apenasAtivos = true): Promise<Profissional[]> {
    const rows = await this.prisma.profissional.findMany({
      where: {
        clinicaId: clinicaId.toString(),
        ...(apenasAtivos ? { ativo: true } : {}),
      },
      include:  { disponibilidades: true },
      orderBy:  { nome: 'asc' },
    });
    return rows.map(r => this.toDomain(r));
  }

  private toDomain(raw: any): Profissional {
    return Profissional.reconstituir(
      {
        clinicaId:      new UniqueEntityID(raw.clinicaId),
        nome:           raw.nome,
        especialidade:  raw.especialidade ?? undefined,
        telefone:       raw.telefone ?? undefined,
        ativo:          raw.ativo,
        disponibilidades: (raw.disponibilidades ?? []).map((d: any) => ({
          diaSemana:  d.diaSemana,
          horaInicio: d.horaInicio,
          horaFim:    d.horaFim,
        })),
      },
      new UniqueEntityID(raw.id),
    );
  }
}
