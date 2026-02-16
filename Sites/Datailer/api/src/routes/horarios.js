import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { parseHorarios, getDiaSemana, gerarSlots, addMinutes } from '../utils.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/:lavacarId/:data/:servicoId', async (req, res) => {
  try {
    const { lavacarId, data, servicoId } = req.params;
    const servico = await prisma.servico.findFirst({ where: { id: servicoId, lavaCarId: lavacarId, ativo: true } });
    if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
    const lavacar = await prisma.lavaCar.findFirst({ where: { id: lavacarId, ativo: true } });
    if (!lavacar) return res.status(404).json({ erro: 'Estabelecimento não encontrado' });
    const horarios = parseHorarios(lavacar.horariosFuncionamento);
    const dia = getDiaSemana(data);
    const configDia = horarios[dia];
    if (!configDia || !configDia.abertura || !configDia.fechamento) return res.json([]);
    const intervalo = lavacar.intervaloSlots || 30;
    const slotsBrutos = gerarSlots(configDia.abertura, configDia.fechamento, intervalo);
    const duracao = servico.duracao || 60;
    const slotsValidos = slotsBrutos.filter(slot => addMinutes(slot, duracao) <= configDia.fechamento);
    const agendados = await prisma.agendamento.findMany({
      where: { lavaCarId: lavacarId, data, status: 'confirmado' },
      select: { horaInicio: true },
    });
    const ocupados = new Set(agendados.map(a => a.horaInicio));
    const disponiveis = slotsValidos.filter(s => !ocupados.has(s));
    res.json(disponiveis);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao buscar horários' });
  }
});

export default router;
