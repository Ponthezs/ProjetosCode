import { Router } from 'express';
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

// GET /servicos/:lavacarId - Listar (público)
router.get('/:lavacarId', async (req, res) => {
  try {
    const list = await prisma.servico.findMany({
      where: { lavaCarId: req.params.lavacarId, ativo: true },
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao listar' });
  }
});

// POST /servicos - Criar (auth lavacar)
router.post('/', async (req, res) => {
  try {
    const user = getTokenUser(req);
    if (!user || user.tipo !== 'lavacar') return res.status(401).json({ erro: 'Acesso negado' });
    const { lavaCarId, nome, preco, duracao, descricao } = req.body || {};
    if (!lavaCarId || user.id !== lavaCarId || !nome || preco == null) {
      return res.status(400).json({ erro: 'lavaCarId, nome e preco obrigatórios' });
    }
    const s = await prisma.servico.create({
      data: {
        lavaCarId,
        nome: (nome || '').trim(),
        preco: parseFloat(preco) || 0,
        duracao: parseInt(duracao, 10) || 60,
        descricao: (descricao || '').trim() || null,
      },
    });
    res.status(201).json(s);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao criar' });
  }
});

// PUT /servicos/:id - Atualizar (auth lavacar)
router.put('/:id', async (req, res) => {
  try {
    const user = getTokenUser(req);
    if (!user || user.tipo !== 'lavacar') return res.status(401).json({ erro: 'Acesso negado' });
    const s = await prisma.servico.findUnique({ where: { id: req.params.id } });
    if (!s || s.lavaCarId !== user.id) return res.status(404).json({ erro: 'Não encontrado' });
    const { nome, preco, duracao, descricao, ativo } = req.body || {};
    const updated = await prisma.servico.update({
      where: { id: req.params.id },
      data: {
        ...(nome != null && { nome: String(nome).trim() }),
        ...(preco != null && { preco: parseFloat(preco) || 0 }),
        ...(duracao != null && { duracao: parseInt(duracao, 10) || 60 }),
        ...(descricao != null && { descricao: String(descricao).trim() || null }),
        ...(ativo != null && { ativo: !!ativo }),
      },
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao atualizar' });
  }
});

// DELETE /servicos/:id
router.delete('/:id', async (req, res) => {
  try {
    const user = getTokenUser(req);
    if (!user || user.tipo !== 'lavacar') return res.status(401).json({ erro: 'Acesso negado' });
    const s = await prisma.servico.findUnique({ where: { id: req.params.id } });
    if (!s || s.lavaCarId !== user.id) return res.status(404).json({ erro: 'Não encontrado' });
    await prisma.servico.update({
      where: { id: req.params.id },
      data: { ativo: false },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao excluir' });
  }
});

export default router;
