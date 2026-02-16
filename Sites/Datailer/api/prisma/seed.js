import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existente = await prisma.lavaCar.findFirst({
    where: { email: 'admin@lavacar.com' },
  });
  if (existente) {
    console.log('Lava-car já existe: admin@lavacar.com / senha: 123456');
    return;
  }
  const senhaHash = await bcrypt.hash('123456', 10);
  const lavacar = await prisma.lavaCar.create({
    data: {
      nome: 'Lava Rápido Centro',
      email: 'admin@lavacar.com',
      senhaHash,
      telefone: '(11) 99999-9999',
      endereco: 'Rua Exemplo, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      horariosFuncionamento: JSON.stringify({
        '1': { abertura: '08:00', fechamento: '18:00' },
        '2': { abertura: '08:00', fechamento: '18:00' },
        '3': { abertura: '08:00', fechamento: '18:00' },
        '4': { abertura: '08:00', fechamento: '18:00' },
        '5': { abertura: '08:00', fechamento: '18:00' },
        '6': { abertura: '08:00', fechamento: '12:00' },
      }),
      intervaloSlots: 30,
      taxaCancelamento: 20,
    },
  });
  await prisma.servico.create({
    data: {
      lavaCarId: lavacar.id,
      nome: 'Lavagem Simples',
      preco: 50,
      duracao: 30,
      descricao: 'Lavagem externa',
    },
  });
  await prisma.servico.create({
    data: {
      lavaCarId: lavacar.id,
      nome: 'Lavagem Completa',
      preco: 80,
      duracao: 60,
      descricao: 'Lavagem interna e externa',
    },
  });
  console.log('Seed concluído. Lava-car: admin@lavacar.com / senha: 123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
