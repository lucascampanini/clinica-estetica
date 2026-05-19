-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMIN', 'PROFISSIONAL', 'RECEPCIONISTA');

-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO', 'NAO_COMPARECEU');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "StatusCobranca" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "PeriodoRotina" AS ENUM ('MANHA', 'TARDE', 'NOITE', 'QUALQUER');

-- CreateEnum
CREATE TYPE "StatusRetorno" AS ENUM ('PENDENTE', 'AGENDADO', 'EXPIRADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "clinicas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anamneses" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "conteudo" JSONB NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anamneses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profissionais" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidade" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidades_profissional" (
    "id" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,

    CONSTRAINT "disponibilidades_profissional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "duracaoMinutos" INTEGER NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "status" "StatusAgendamento" NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cobrancas" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "agendamentoId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "status" "StatusCobranca" NOT NULL DEFAULT 'PENDENTE',
    "pagoEm" TIMESTAMP(3),
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cobrancas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotinas" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passos_rotina" (
    "id" TEXT NOT NULL,
    "rotinaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "produto" TEXT,
    "instrucoes" TEXT,
    "periodo" "PeriodoRotina" NOT NULL,
    "horarioSugerido" TEXT,
    "diasSemana" INTEGER[],
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passos_rotina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_diarios" (
    "id" TEXT NOT NULL,
    "rotinaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "percentualConcluido" DOUBLE PRECISION,
    "estrelasGanhas" INTEGER,

    CONSTRAINT "registros_diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conclusoes_passo" (
    "id" TEXT NOT NULL,
    "registroDiarioId" TEXT NOT NULL,
    "passoRotinaId" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "concluidoEm" TIMESTAMP(3),

    CONSTRAINT "conclusoes_passo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_evolucao" (
    "id" TEXT NOT NULL,
    "registroDiarioId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "legenda" TEXT,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fotos_evolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pontuacao_clientes" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "estrelasTotal" INTEGER NOT NULL DEFAULT 0,
    "streakAtual" INTEGER NOT NULL DEFAULT 0,
    "streakMaximo" INTEGER NOT NULL DEFAULT 0,
    "ultimoDiaFeito" DATE,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pontuacao_clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes_atendimento" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "servico" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retornos_recomendados" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "dataRetorno" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "status" "StatusRetorno" NOT NULL DEFAULT 'PENDENTE',
    "lembrete7dias" BOOLEAN NOT NULL DEFAULT false,
    "lembrete1dia" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retornos_recomendados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos_vitrine" (
    "id" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "imagemUrl" TEXT,
    "preco" DECIMAL(10,2),
    "categoria" TEXT,
    "linkParceiro" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "totalCliques" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_vitrine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliques_vitrine" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "clienteId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliques_vitrine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_tokens" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinicas_cnpj_key" ON "clinicas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_clinicaId_email_key" ON "usuarios"("clinicaId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_clinicaId_telefone_key" ON "clientes"("clinicaId", "telefone");

-- CreateIndex
CREATE INDEX "agendamentos_clinicaId_inicio_idx" ON "agendamentos"("clinicaId", "inicio");

-- CreateIndex
CREATE INDEX "agendamentos_profissionalId_inicio_idx" ON "agendamentos"("profissionalId", "inicio");

-- CreateIndex
CREATE UNIQUE INDEX "cobrancas_agendamentoId_key" ON "cobrancas"("agendamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "registros_diarios_rotinaId_data_key" ON "registros_diarios"("rotinaId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "conclusoes_passo_registroDiarioId_passoRotinaId_key" ON "conclusoes_passo"("registroDiarioId", "passoRotinaId");

-- CreateIndex
CREATE UNIQUE INDEX "pontuacao_clientes_clienteId_key" ON "pontuacao_clientes"("clienteId");

-- CreateIndex
CREATE INDEX "avaliacoes_atendimento_clinicaId_criadoEm_idx" ON "avaliacoes_atendimento"("clinicaId", "criadoEm");

-- CreateIndex
CREATE INDEX "retornos_recomendados_clinicaId_dataRetorno_status_idx" ON "retornos_recomendados"("clinicaId", "dataRetorno", "status");

-- CreateIndex
CREATE INDEX "produtos_vitrine_clinicaId_ativo_ordem_idx" ON "produtos_vitrine"("clinicaId", "ativo", "ordem");

-- CreateIndex
CREATE INDEX "cliques_vitrine_produtoId_criadoEm_idx" ON "cliques_vitrine"("produtoId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_token_key" ON "push_tokens"("token");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissionais" ADD CONSTRAINT "profissionais_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidades_profissional" ADD CONSTRAINT "disponibilidades_profissional_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobrancas" ADD CONSTRAINT "cobrancas_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobrancas" ADD CONSTRAINT "cobrancas_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotinas" ADD CONSTRAINT "rotinas_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotinas" ADD CONSTRAINT "rotinas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotinas" ADD CONSTRAINT "rotinas_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passos_rotina" ADD CONSTRAINT "passos_rotina_rotinaId_fkey" FOREIGN KEY ("rotinaId") REFERENCES "rotinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_diarios" ADD CONSTRAINT "registros_diarios_rotinaId_fkey" FOREIGN KEY ("rotinaId") REFERENCES "rotinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_diarios" ADD CONSTRAINT "registros_diarios_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conclusoes_passo" ADD CONSTRAINT "conclusoes_passo_registroDiarioId_fkey" FOREIGN KEY ("registroDiarioId") REFERENCES "registros_diarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conclusoes_passo" ADD CONSTRAINT "conclusoes_passo_passoRotinaId_fkey" FOREIGN KEY ("passoRotinaId") REFERENCES "passos_rotina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_evolucao" ADD CONSTRAINT "fotos_evolucao_registroDiarioId_fkey" FOREIGN KEY ("registroDiarioId") REFERENCES "registros_diarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_evolucao" ADD CONSTRAINT "fotos_evolucao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontuacao_clientes" ADD CONSTRAINT "pontuacao_clientes_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontuacao_clientes" ADD CONSTRAINT "pontuacao_clientes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes_atendimento" ADD CONSTRAINT "avaliacoes_atendimento_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes_atendimento" ADD CONSTRAINT "avaliacoes_atendimento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retornos_recomendados" ADD CONSTRAINT "retornos_recomendados_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retornos_recomendados" ADD CONSTRAINT "retornos_recomendados_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retornos_recomendados" ADD CONSTRAINT "retornos_recomendados_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos_vitrine" ADD CONSTRAINT "produtos_vitrine_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliques_vitrine" ADD CONSTRAINT "cliques_vitrine_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos_vitrine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
