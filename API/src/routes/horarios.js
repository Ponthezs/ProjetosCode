import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { parseHorarios, getDiaSemana, gerarSlots, addMinutes } from '../utils.js';

const router = Router();
const prisma = new PrismaClient();

// GET /horarios/:lavacarId/:data/:servicoId - Horários disponíveis (público)
router.get('/:lavacarId/:data/:servicoId', async (req, res) => {
  try {
    const { lavacarId, data, servicoId } = req.params;
    const servico = await prisma.servico.findFirst({
      where: { id: servicoId, lavaCarId: lavacarId, ativo: true },
    });
    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }
    const lavacar = await prisma.lavaCar.findFirst({
      where: { id: lavacarId, ativo: true },
    });
    if (!lavacar) {
      return res.status(404).json({ erro: 'Estabelecimento não encontrado' });
    }
    const horarios = parseHorarios(lavacar.horariosFuncionamento);
    const dia = getDiaSemana(data);
    const configDia = horarios[dia];
    if (!configDia || !configDia.abertura || !configDia.fechamento) {
      return res.json([]); // fechado nesse dia
    }
    const intervalo = lavacar.intervaloSlots || 30;
    const slotsBrutos = gerarSlots(configDia.abertura, configDia.fechamento, intervalo);
    const duracao = servico.duracao || 60;
    const slotsValidos = slotsBrutos.filter(slot => {
      const fim = addMinutes(slot, duracao);
      return fim <= configDia.fechamento;
    });
    const agendados = await prisma.agendamento.findMany({
      where: {
        lavaCarId: lavacarId,
        data,
        status: 'confirmado',
      },
      select: { horaInicio: true, horaFim: true },
    });
    const ocupados = new Set();
    agendados.forEach(a => {
      ocupados.add(a.horaInicio);
    });
    const disponiveis = slotsValidos.filter(s => !ocupados.has(s));
    res.json(disponiveis);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao buscar horários' });
  }
});

export default router;
