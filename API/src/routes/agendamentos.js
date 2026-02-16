import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';
import { addMinutes } from '../utils.js';
import {
  enviarEmail,
  templateConfirmacaoAgendamento,
  templateCancelamento,
  templateNovoAgendamentoAdmin,
} from '../mailer.js';

const router = Router();
const prisma = new PrismaClient();

function getTokenUser(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.slice(7), config.jwtSecret);
  } catch {
    return null;
  }
}

// POST /agendamentos - Criar (requer login cliente)
router.post('/', async (req, res) => {
  try {
    const user = getTokenUser(req);
    if (!user || user.tipo !== 'cliente') {
      return res.status(401).json({ erro: 'Login necessário' });
    }
    const { lavacarId, servicoId, data, horaInicio } = req.body || {};
    if (!lavacarId || !servicoId || !data || !horaInicio) {
      return res.status(400).json({ erro: 'lavacarId, servicoId, data e horaInicio obrigatórios' });
    }
    const servico = await prisma.servico.findFirst({
      where: { id: servicoId, lavaCarId: lavacarId, ativo: true },
    });
    if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
    const lavaCar = await prisma.lavaCar.findFirst({
      where: { id: lavacarId, ativo: true },
    });
    if (!lavaCar) return res.status(404).json({ erro: 'Estabelecimento não encontrado' });
    const cliente = await prisma.cliente.findUnique({
      where: { id: user.id },
    });
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
    const horaFim = addMinutes(horaInicio, servico.duracao);
    const conflito = await prisma.agendamento.findFirst({
      where: {
        lavaCarId: lavacarId,
        data,
        status: 'confirmado',
        horaInicio: { lt: horaFim },
        horaFim: { gt: horaInicio },
      },
    });
    if (conflito) {
      return res.status(400).json({ erro: 'Este horário não está mais disponível' });
    }
    const agendamento = await prisma.agendamento.create({
      data: {
        lavaCarId,
        clienteId: cliente.id,
        servicoId,
        data,
        horaInicio,
        horaFim,
        valor: servico.preco,
        status: 'confirmado',
      },
      include: {
        lavaCar: true,
        cliente: true,
        servico: true,
      },
    });
    await enviarEmail(
      cliente.email,
      'Agendamento Confirmado - Datailer',
      templateConfirmacaoAgendamento({
        clienteNome: cliente.nome,
        lavaCarNome: lavaCar.nome,
        servicoNome: servico.nome,
        data,
        hora: horaInicio,
        valor: servico.preco,
        endereco: lavaCar.endereco + ', ' + lavaCar.cidade + ' - ' + lavaCar.estado,
      })
    );
    await prisma.agendamento.update({
      where: { id: agendamento.id },
      data: { emailConfirmacaoEnviado: true },
    });
    await enviarEmail(
      lavaCar.email,
      'Novo Agendamento - Datailer',
      templateNovoAgendamentoAdmin({
        lavaCarNome: lavaCar.nome,
        clienteNome: cliente.nome,
        servicoNome: servico.nome,
        data,
        hora: horaInicio,
        valor: servico.preco,
      })
    );
    res.status(201).json({
      id: agendamento.id,
      data: agendamento.data,
      horaInicio: agendamento.horaInicio,
      status: agendamento.status,
      valor: agendamento.valor,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
});

// GET /agendamentos - Listar do cliente logado
router.get('/', async (req, res) => {
  try {
    const user = getTokenUser(req);
    if (!user || user.tipo !== 'cliente') {
      return res.status(401).json({ erro: 'Login necessário' });
    }
    const list = await prisma.agendamento.findMany({
      where: { clienteId: user.id },
      orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
      include: {
        lavaCar: { select: { id: true, nome: true, endereco: true, cidade: true } },
        servico: { select: { id: true, nome: true, preco: true } },
      },
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao listar' });
  }
});

// GET /agendamentos/lavacar/:id - Listar por lava-car (requer auth lavacar)
router.get('/lavacar/:id', async (req, res) => {
  try {
    const user = getTokenUser(req);
    if (!user || user.tipo !== 'lavacar' || user.id !== req.params.id) {
      return res.status(401).json({ erro: 'Acesso negado' });
    }
    const list = await prisma.agendamento.findMany({
      where: { lavaCarId: req.params.id },
      orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
      include: {
        cliente: { select: { id: true, nome: true, email: true, telefone: true } },
        servico: { select: { id: true, nome: true, preco: true } },
      },
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao listar' });
  }
});

// PATCH /agendamentos/:id/cancelar
router.patch('/:id/cancelar', async (req, res) => {
  try {
    const user = getTokenUser(req);
    if (!user) return res.status(401).json({ erro: 'Login necessário' });
    const ag = await prisma.agendamento.findUnique({
      where: { id: req.params.id },
      include: { lavaCar: true, cliente: true, servico: true },
    });
    if (!ag) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    const podeCancelar =
      (user.tipo === 'cliente' && ag.clienteId === user.id) ||
      (user.tipo === 'lavacar' && ag.lavaCarId === user.id);
    if (!podeCancelar) return res.status(403).json({ erro: 'Acesso negado' });
    if (ag.status === 'cancelado') {
      return res.status(400).json({ erro: 'Já está cancelado' });
    }
    const agora = new Date();
    const dataAg = new Date(ag.data + 'T' + ag.horaInicio);
    const diffH = (dataAg - agora) / (1000 * 60 * 60);
    let taxaCobrada = null;
    if (diffH < 24 && user.tipo === 'cliente' && ag.lavaCar.taxaCancelamento > 0) {
      taxaCobrada = ag.lavaCar.taxaCancelamento;
    }
    await prisma.agendamento.update({
      where: { id: ag.id },
      data: {
        status: 'cancelado',
        canceladoEm: agora,
        motivoCancelamento: req.body.motivo || null,
        taxaCobrada,
      },
    });
    await enviarEmail(
      ag.cliente.email,
      'Agendamento Cancelado - Datailer',
      templateCancelamento({
        clienteNome: ag.cliente.nome,
        lavaCarNome: ag.lavaCar.nome,
        servicoNome: ag.servico.nome,
        data: ag.data,
        hora: ag.horaInicio,
      })
    );
    await prisma.agendamento.update({
      where: { id: ag.id },
      data: { emailCancelamentoEnviado: true },
    });
    res.json({ ok: true, taxaCobrada });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao cancelar' });
  }
});

// PATCH /agendamentos/:id/concluir (lavacar)
router.patch('/:id/concluir', async (req, res) => {
  try {
    const user = getTokenUser(req);
    if (!user || user.tipo !== 'lavacar') return res.status(401).json({ erro: 'Acesso negado' });
    const ag = await prisma.agendamento.findUnique({
      where: { id: req.params.id },
    });
    if (!ag || ag.lavaCarId !== user.id) return res.status(404).json({ erro: 'Não encontrado' });
    await prisma.agendamento.update({
      where: { id: req.params.id },
      data: { status: 'concluido' },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao concluir' });
  }
});

export default router;
