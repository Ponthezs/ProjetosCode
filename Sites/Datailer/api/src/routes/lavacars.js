import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { cidade, estado } = req.query || {};
    const where = { ativo: true };
    if (cidade) where.cidade = { contains: cidade };
    if (estado) where.estado = (estado || '').toUpperCase().slice(0, 2);
    const list = await prisma.lavaCar.findMany({
      where,
      include: { servicos: { where: { ativo: true } } },
    });
    res.json(list.map(l => ({ id: l.id, nome: l.nome, endereco: l.endereco, cidade: l.cidade, estado: l.estado, telefone: l.telefone, horariosFuncionamento: l.horariosFuncionamento, intervaloSlots: l.intervaloSlots, taxaCancelamento: l.taxaCancelamento, servicos: l.servicos })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao listar estabelecimentos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lavacar = await prisma.lavaCar.findFirst({
      where: { id: req.params.id, ativo: true },
      include: { servicos: { where: { ativo: true } } },
    });
    if (!lavacar) return res.status(404).json({ erro: 'Não encontrado' });
    res.json({ id: lavacar.id, nome: lavacar.nome, endereco: lavacar.endereco, cidade: lavacar.cidade, estado: lavacar.estado, cep: lavacar.cep, telefone: lavacar.telefone, horariosFuncionamento: lavacar.horariosFuncionamento, intervaloSlots: lavacar.intervaloSlots, taxaCancelamento: lavacar.taxaCancelamento, servicos: lavacar.servicos });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao buscar' });
  }
});

export default router;
