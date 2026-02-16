import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';

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

// GET /lavacar-admin/me - Dados do estabelecimento (auth lavacar)
router.get('/me', async (req, res) => {
  try {
    const user = getTokenUser(req);
    if (!user || user.tipo !== 'lavacar') return res.status(401).json({ erro: 'Acesso negado' });
    const lavacar = await prisma.lavaCar.findUnique({
      where: { id: user.id },
      include: { servicos: true },
    });
    if (!lavacar) return res.status(404).json({ erro: 'Não encontrado' });
    const { senhaHash, ...rest } = lavacar;
    res.json(rest);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro' });
  }
});

// PUT /lavacar-admin/me - Atualizar estabelecimento
router.put('/me', async (req, res) => {
  try {
    const user = getTokenUser(req);
    if (!user || user.tipo !== 'lavacar') return res.status(401).json({ erro: 'Acesso negado' });
    const { nome, telefone, endereco, cidade, estado, cep, horariosFuncionamento, intervaloSlots, taxaCancelamento } = req.body || {};
    const data = {};
    if (nome != null) data.nome = String(nome).trim();
    if (telefone != null) data.telefone = String(telefone).trim() || null;
    if (endereco != null) data.endereco = String(endereco).trim();
    if (cidade != null) data.cidade = String(cidade).trim();
    if (estado != null) data.estado = String(estado).trim().toUpperCase().slice(0, 2);
    if (cep != null) data.cep = String(cep).trim() || null;
    if (horariosFuncionamento != null) data.horariosFuncionamento = typeof horariosFuncionamento === 'string' ? horariosFuncionamento : JSON.stringify(horariosFuncionamento);
    if (intervaloSlots != null) data.intervaloSlots = parseInt(intervaloSlots, 10) || 30;
    if (taxaCancelamento != null) data.taxaCancelamento = parseFloat(taxaCancelamento) || 0;
    const lavacar = await prisma.lavaCar.update({
      where: { id: user.id },
      data,
    });
    const { senhaHash, ...rest } = lavacar;
    res.json(rest);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao atualizar' });
  }
});

export default router;
