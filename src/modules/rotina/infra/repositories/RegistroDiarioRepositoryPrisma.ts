import { PrismaClient } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IRegistroDiarioRepository } from '../../domain/repositories/IRegistroDiarioRepository';
import { RegistroDiario, ItemChecklist } from '../../domain/entities/RegistroDiario';
import { Estrelas } from '../../domain/value-objects/Estrelas';

export class RegistroDiarioRepositoryPrisma implements IRegistroDiarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorRotinaEData(rotinaId: UniqueEntityID, data: Date): Promise<RegistroDiario | null> {
    const raw = await this.prisma.registroDiario.findUnique({
      where: {
        rotinaId_data: { rotinaId: rotinaId.toString(), data },
      },
      include: {
        conclusoes: true,
        fotos: true,
      },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async buscarHistorico(clienteId: UniqueEntityID, limite: number): Promise<RegistroDiario[]> {
    const raws = await this.prisma.registroDiario.findMany({
      where: { clienteId: clienteId.toString() },
      orderBy: { data: 'desc' },
      take: limite,
      include: { conclusoes: true, fotos: true },
    });
    return raws.map(r => this.toDomain(r));
  }

  async salvar(registro: RegistroDiario): Promise<void> {
    await this.prisma.registroDiario.create({
      data: {
        id:        registro.id.toString(),
        rotinaId:  registro.rotinaId.toString(),
        clienteId: registro.clienteId.toString(),
        data:      registro.data,
        percentualConcluido: registro.percentualConcluido,
        estrelasGanhas:      registro.estrelasGanhas?.quantidade,
        conclusoes: {
          create: registro.checklist.map(item => ({
            passoRotinaId: item.passoRotinaId.toString(),
            concluido:     item.concluido,
            concluidoEm:   item.concluidoEm,
          })),
        },
      },
    });
  }

  async atualizar(registro: RegistroDiario): Promise<void> {
    await this.prisma.registroDiario.update({
      where: { id: registro.id.toString() },
      data: {
        percentualConcluido: registro.percentualConcluido,
        estrelasGanhas:      registro.estrelasGanhas?.quantidade,
      },
    });

    for (const item of registro.checklist) {
      await this.prisma.conclusaoPasso.updateMany({
        where: {
          registroDiarioId: registro.id.toString(),
          passoRotinaId:    item.passoRotinaId.toString(),
        },
        data: {
          concluido:   item.concluido,
          concluidoEm: item.concluidoEm,
        },
      });
    }

    // Salva fotos novas (as URLs já existentes são ignoradas pelo unique)
    for (const url of registro.fotosUrl) {
      await this.prisma.fotoEvolucao.upsert({
        where: { id: `${registro.id.toString()}_${url}` },
        create: {
          id:               `${registro.id.toString()}_${url}`,
          registroDiarioId: registro.id.toString(),
          clienteId:        registro.clienteId.toString(),
          url,
        },
        update: {},
      });
    }
  }

  private toDomain(raw: any): RegistroDiario {
    const checklist: ItemChecklist[] = raw.conclusoes.map((c: any) => ({
      passoRotinaId: new UniqueEntityID(c.passoRotinaId),
      concluido:     c.concluido,
      concluidoEm:   c.concluidoEm ?? undefined,
    }));

    const fotosUrl: string[] = raw.fotos?.map((f: any) => f.url) ?? [];

    const registroOrError = RegistroDiario.criar(
      {
        rotinaId:    new UniqueEntityID(raw.rotinaId),
        clienteId:   new UniqueEntityID(raw.clienteId),
        data:        raw.data,
        totalPassos: raw.conclusoes.length,
        passosDodia: raw.conclusoes.map((c: any) => new UniqueEntityID(c.passoRotinaId)),
      },
      new UniqueEntityID(raw.id),
    );

    const registro = registroOrError.getValue();
    registro.clearEvents();

    // Restaura estado do checklist
    for (const item of checklist) {
      const existente = registro.checklist.find(i => i.passoRotinaId.equals(item.passoRotinaId));
      if (existente && item.concluido) {
        existente.concluido = true;
        existente.concluidoEm = item.concluidoEm;
      }
    }

    // Restaura fotos
    for (const url of fotosUrl) {
      registro.adicionarFoto(url);
    }

    // Restaura percentual e estrelas persistidos
    if (raw.percentualConcluido !== null) {
      (registro as any).props.percentualConcluido = raw.percentualConcluido;
    }
    if (raw.estrelasGanhas !== null) {
      const estrelasOrError = Estrelas.criar(raw.estrelasGanhas);
      if (estrelasOrError.isSuccess) {
        (registro as any).props.estrelasGanhas = estrelasOrError.getValue();
      }
    }

    return registro;
  }
}
