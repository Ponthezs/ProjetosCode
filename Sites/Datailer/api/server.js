import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import lavacarsRoutes from './src/routes/lavacars.js';
import horariosRoutes from './src/routes/horarios.js';
import agendamentosRoutes from './src/routes/agendamentos.js';
import servicosRoutes from './src/routes/servicos.js';
import lavacarAdminRoutes from './src/routes/lavacarAdmin.js';
import { config } from './src/config.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/lavacars', lavacarsRoutes);
app.use('/horarios', horariosRoutes);
app.use('/agendamentos', agendamentosRoutes);
app.use('/servicos', servicosRoutes);
app.use('/lavacar-admin', lavacarAdminRoutes);

app.listen(config.port, () => {
  console.log(`API Datailer rodando na porta ${config.port}`);
});
