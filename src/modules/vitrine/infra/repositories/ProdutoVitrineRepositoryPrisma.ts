import { PrismaClient, Prisma } from '@prisma/client';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { IProdutoVitrineRepository } from '../../domain/repositories/IProdutoVitrineRepository';
import { ProdutoVitrine } from '../../domain/entities/ProdutoVitrine';
import { LinkParceiro } from '../../domain/value-objects/LinkParceiro';

export class ProdutoVitrineRepositoryPrisma implements IProdutoVitrineRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorId(id: UniqueEntityID): Promise<ProdutoVitrine | null> {
    const raw = await this.prisma.produtoVitrine.findUnique({ where: { id: id.toString() } });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async listarAtivos(clinicaId: UniqueEntityID): Promise<ProdutoVitrine[]> {
    const raws = await this.prisma.produtoVitrine.findMany({
      where: { clinicaId: clinicaId.toString(), ativo: true },
      orderBy: [{ destaque: 'desc' }, { ordem: 'asc' }, { nome: 'asc' }],
    });
    return raws.map(r => this.toDomain(r));
  }

  async listarTodos(clinicaId: UniqueEntityID): Promise<ProdutoVitrine[]> {
    const raws = await this.prisma.produtoVitrine.findMany({
      where: { clinicaId: clinicaId.toString() },
      orderBy: [{ destaque: 'desc' }, { ordem: 'asc' }, { nome: 'asc' }],
    });
    return raws.map(r => this.toDomain(r));
  }

  async salvar(produto: ProdutoVitrine): Promise<void> {
    await this.prisma.produtoVitrine.create({
      data: {
        id:           produto.id.toString(),
        clinicaId:    produto.clinicaId.toString(),
        nome:         produto.nome,
        descricao:    produto.descricao,
        imagemUrl:    produto.imagemUrl,
        preco:        produto.preco ? new Prisma.Decimal(produto.preco) : null,
        categoria:    produto.categoria,
        linkParceiro: produto.linkParceiro.url,
        ativo:        produto.ativo,
        destaque:     produto.destaque,
        ordem:        produto.ordem,
        totalCliques: produto.totalCliques,
      },
    });
  }

  async atualizar(produto: ProdutoVitrine): Promise<void> {
    await this.prisma.produtoVitrine.update({
      where: { id: produto.id.toString() },
      data: {
        nome:         produto.nome,
        descricao:    produto.descricao,
        imagemUrl:    produto.imagemUrl,
        preco:        produto.preco ? new Prisma.Decimal(produto.preco) : null,
        categoria:    produto.categoria,
        linkParceiro: produto.linkParceiro.url,
        ativo:        produto.ativo,
        destaque:     produto.destaque,
        ordem:        produto.ordem,
      },
    });
  }

  async registrarClique(produtoId: UniqueEntityID, clienteId?: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.cliqueVitrine.create({
        data: {
          produtoId: produtoId.toString(),
          clienteId: clienteId ?? null,
        },
      }),
      this.prisma.produtoVitrine.update({
        where: { id: produtoId.toString() },
        data: { totalCliques: { increment: 1 } },
      }),
    ]);
  }

  private toDomain(raw: any): ProdutoVitrine {
    const linkOrError = LinkParceiro.criar(raw.linkParceiro);
    const produtoOrError = ProdutoVitrine.criar(
      {
        clinicaId:    new UniqueEntityID(raw.clinicaId),
        nome:         raw.nome,
        descricao:    raw.descricao ?? undefined,
        imagemUrl:    raw.imagemUrl ?? undefined,
        preco:        raw.preco ? Number(raw.preco) : undefined,
        categoria:    raw.categoria ?? undefined,
        linkParceiro: linkOrError.getValue(),
        ordem:        raw.ordem,
      },
      new UniqueEntityID(raw.id),
    );
    const produto = produtoOrError.getValue();
    // Restaura estado persistido
    if (!raw.ativo) produto.desativar();
    if (raw.destaque) produto.marcarComoDestaque(true);
    (produto as any).props.totalCliques = raw.totalCliques;
    return produto;
  }
}
