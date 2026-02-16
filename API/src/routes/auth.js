import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';

const router = Router();
const prisma = new PrismaClient();

// POST /auth/cliente/login
router.post('/cliente/login', async (req, res) => {
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha obrigatórios' });
    }
    const cliente = await prisma.cliente.findUnique({
      where: { email: email.toLowerCase().trim(), ativo: true },
    });
    if (!cliente || !cliente.senhaHash) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    const ok = await bcrypt.compare(senha, cliente.senhaHash);
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const token = jwt.sign(
      { tipo: 'cliente', id: cliente.id },
      config.jwtSecret,
      { expiresIn: config.jwtExpires }
    );
    res.json({
      token,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        cidade: cliente.cidade,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// POST /auth/cliente/registro
router.post('/cliente/registro', async (req, res) => {
  try {
    const { email, senha, nome, telefone, cidade, estado } = req.body || {};
    if (!email || !senha || !nome || !telefone) {
      return res.status(400).json({ erro: 'E-mail, senha, nome e telefone são obrigatórios' });
    }
    const existente = await prisma.cliente.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existente) {
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const cliente = await prisma.cliente.create({
      data: {
        email: email.toLowerCase().trim(),
        senhaHash,
        nome: (nome || '').trim(),
        telefone: (telefone || '').trim(),
        cidade: (cidade || '').trim() || null,
        estado: (estado || '').trim() || null,
      },
    });
    const token = jwt.sign(
      { tipo: 'cliente', id: cliente.id },
      config.jwtSecret,
      { expiresIn: config.jwtExpires }
    );
    res.status(201).json({
      token,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        cidade: cliente.cidade,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao cadastrar' });
  }
});

// POST /auth/lavacar/login
router.post('/lavacar/login', async (req, res) => {
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha obrigatórios' });
    }
    const lavacar = await prisma.lavaCar.findFirst({
      where: { email: email.toLowerCase().trim(), ativo: true },
      include: { servicos: { where: { ativo: true } } },
    });
    if (!lavacar || !lavacar.senhaHash) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    const ok = await bcrypt.compare(senha, lavacar.senhaHash);
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const token = jwt.sign(
      { tipo: 'lavacar', id: lavacar.id },
      config.jwtSecret,
      { expiresIn: config.jwtExpires }
    );
    res.json({
      token,
      lavacar: {
        id: lavacar.id,
        nome: lavacar.nome,
        email: lavacar.email,
        cidade: lavacar.cidade,
        estado: lavacar.estado,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// POST /auth/lavacar/registro (novo lava-car na plataforma)
router.post('/lavacar/registro', async (req, res) => {
  try {
    const { nome, email, senha, telefone, endereco, cidade, estado, cep } = req.body || {};
    if (!nome || !email || !senha || !endereco || !cidade || !estado) {
      return res.status(400).json({ erro: 'Nome, e-mail, senha, endereço, cidade e estado são obrigatórios' });
    }
    const existente = await prisma.lavaCar.findFirst({
      where: { email: email.toLowerCase().trim() },
    });
    if (existente) {
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const horariosPadrao = JSON.stringify({
      '1': { abertura: '08:00', fechamento: '18:00' },
      '2': { abertura: '08:00', fechamento: '18:00' },
      '3': { abertura: '08:00', fechamento: '18:00' },
      '4': { abertura: '08:00', fechamento: '18:00' },
      '5': { abertura: '08:00', fechamento: '18:00' },
      '6': { abertura: '08:00', fechamento: '12:00' },
    });
    const lavacar = await prisma.lavaCar.create({
      data: {
        nome: (nome || '').trim(),
        email: email.toLowerCase().trim(),
        senhaHash,
        telefone: (telefone || '').trim() || null,
        endereco: (endereco || '').trim(),
        cidade: (cidade || '').trim(),
        estado: (estado || '').trim().toUpperCase().slice(0, 2),
        cep: (cep || '').trim() || null,
        horariosFuncionamento: horariosPadrao,
      },
    });
    const token = jwt.sign(
      { tipo: 'lavacar', id: lavacar.id },
      config.jwtSecret,
      { expiresIn: config.jwtExpires }
    );
    res.status(201).json({
      token,
      lavacar: {
        id: lavacar.id,
        nome: lavacar.nome,
        email: lavacar.email,
        cidade: lavacar.cidade,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao cadastrar estabelecimento' });
  }
});

export default router;
