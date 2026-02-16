import nodemailer from 'nodemailer';
import { config } from './config.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
});

// Em desenvolvimento sem SMTP configurado, apenas loga
const envioReal = config.smtp.user && config.smtp.pass;

export async function enviarEmail(destino, assunto, html) {
  if (!envioReal) {
    console.log('[EMAIL] (simulado)', { destino, assunto });
    return { ok: true, simulado: true };
  }
  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: destino,
      subject: assunto,
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error('[EMAIL] Erro:', err.message);
    return { ok: false, error: err.message };
  }
}

export function templateConfirmacaoAgendamento(dados) {
  const { clienteNome, lavaCarNome, servicoNome, data, hora, valor, endereco } = dados;
  return `
    <h2>Agendamento Confirmado</h2>
    <p>Olá, <strong>${clienteNome}</strong>!</p>
    <p>Seu agendamento foi confirmado:</p>
    <ul>
      <li><strong>Estabelecimento:</strong> ${lavaCarNome}</li>
      <li><strong>Serviço:</strong> ${servicoNome}</li>
      <li><strong>Data:</strong> ${data}</li>
      <li><strong>Horário:</strong> ${hora}</li>
      <li><strong>Valor:</strong> R$ ${valor?.toFixed(2) || '0,00'}</li>
      <li><strong>Endereço:</strong> ${endereco || '-'}</li>
    </ul>
    <p><strong>⚠️ Importante:</strong> Cancelamentos devem ser feitos com no mínimo 24 horas de antecedência. Caso contrário, poderá ser cobrada uma taxa de cancelamento.</p>
    <p>Obrigado por escolher nossa plataforma!</p>
  `;
}

export function templateCancelamento(dados) {
  const { clienteNome, lavaCarNome, servicoNome, data, hora } = dados;
  return `
    <h2>Agendamento Cancelado</h2>
    <p>Olá, <strong>${clienteNome}</strong>!</p>
    <p>Seu agendamento foi cancelado:</p>
    <ul>
      <li><strong>Estabelecimento:</strong> ${lavaCarNome}</li>
      <li><strong>Serviço:</strong> ${servicoNome}</li>
      <li><strong>Data:</strong> ${data}</li>
      <li><strong>Horário:</strong> ${hora}</li>
    </ul>
    <p>Para reagendar, acesse nossa plataforma.</p>
  `;
}

export function templateNovoAgendamentoAdmin(dados) {
  const { lavaCarNome, clienteNome, servicoNome, data, hora, valor } = dados;
  return `
    <h2>Novo Agendamento</h2>
    <p><strong>${lavaCarNome}</strong> recebeu um novo agendamento:</p>
    <ul>
      <li><strong>Cliente:</strong> ${clienteNome}</li>
      <li><strong>Serviço:</strong> ${servicoNome}</li>
      <li><strong>Data:</strong> ${data}</li>
      <li><strong>Horário:</strong> ${hora}</li>
      <li><strong>Valor:</strong> R$ ${valor?.toFixed(2) || '0,00'}</li>
    </ul>
    <p>Acesse o painel administrativo para gerenciar.</p>
  `;
}

export function templateLembrete(dados) {
  const { clienteNome, lavaCarNome, servicoNome, data, hora, endereco } = dados;
  return `
    <h2>Lembrete: Seu agendamento é amanhã</h2>
    <p>Olá, <strong>${clienteNome}</strong>!</p>
    <p>Lembrete do seu agendamento:</p>
    <ul>
      <li><strong>Estabelecimento:</strong> ${lavaCarNome}</li>
      <li><strong>Serviço:</strong> ${servicoNome}</li>
      <li><strong>Data:</strong> ${data}</li>
      <li><strong>Horário:</strong> ${hora}</li>
      <li><strong>Endereço:</strong> ${endereco || '-'}</li>
    </ul>
    <p>Nos vemos em breve!</p>
  `;
}
