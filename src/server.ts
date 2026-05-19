import 'reflect-metadata';
import './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', ts: Date.now() });
});

import { authRoutes }         from './modules/auth/infra/http/routes/authRoutes';
import { catalogoRoutes }     from './modules/catalogo/infra/http/routes/catalogoRoutes';
import { profissionalRoutes } from './modules/profissional/infra/http/routes/profissionalRoutes';
import { agendamentoRoutes }  from './modules/agendamento/infra/http/routes/agendamentoRoutes';
import { financeiroRoutes }   from './modules/financeiro/infra/http/routes/financeiroRoutes';
import { rotinaRoutes }       from './modules/rotina/infra/http/routes/rotinaRoutes';
import { vitrineRoutes }      from './modules/vitrine/infra/http/routes/vitrineRoutes';
import { avaliacaoRoutes }    from './modules/avaliacao/infra/http/routes/avaliacaoRoutes';
import { clienteRoutes }      from './modules/clientes/infra/http/routes/clienteRoutes';
import { retornoRoutes }      from './modules/retorno/infra/http/routes/retornoRoutes';

app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/catalogo',      catalogoRoutes);
app.use('/api/v1/profissionais', profissionalRoutes);
app.use('/api/v1/agendamentos',  agendamentoRoutes);
app.use('/api/v1/financeiro',    financeiroRoutes);
app.use('/api/v1/rotinas',       rotinaRoutes);
app.use('/api/v1/vitrine',       vitrineRoutes);
app.use('/api/v1/avaliacoes',    avaliacaoRoutes);
app.use('/api/v1/clientes',      clienteRoutes);
app.use('/api/v1/retornos',      retornoRoutes);

// TODO: registrar rotas dos módulos aqui
// app.use('/api/v1/agendamentos', agendamentoRoutes);
// app.use('/api/v1/clientes', clienteRoutes);
// app.use('/api/v1/servicos', servicoRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});

export { app };
