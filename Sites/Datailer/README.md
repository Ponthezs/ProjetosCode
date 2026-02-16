# Datailer - Plataforma Multi-Lava-Car

Sistema completo para agendamento de lavagens em lava-cars. Plataforma multiempresa com área do cliente, área administrativa por estabelecimento e notificações por e-mail.

## Funcionalidades

### Banco de Dados
- Todos os dados em MongoDB (Prisma)
- Clientes, lava-cars, serviços, agendamentos, histórico
- Estrutura multiempresa (cada lava-car tem seu painel)

### Área do Cliente
- Cadastro e login
- Buscar lava-cars por cidade
- Escolher tipo de lavagem (serviço)
- Escolher data e apenas horários disponíveis
- Impossível agendar no mesmo horário (validação no backend)
- E-mail automático ao confirmar
- Política de cancelamento: 24h de antecedência; taxa se não cumprir

### Área do Administrador (Lava-Car)
- Cadastro do estabelecimento (nome, endereço, cidade, serviços, horários)
- Visualizar e gerenciar agendamentos
- Cancelar e concluir agendamentos
- Definir taxa de cancelamento fora do prazo
- E-mail ao receber novo agendamento

### Plataforma
- Tela para novos lava-cars se registrarem
- Cada lava-car tem painel próprio
- Clientes veem lava-cars por localidade

### Notificações
- E-mail ao confirmar agendamento (cliente)
- E-mail ao cancelar (cliente)
- E-mail ao lava-car quando há novo agendamento
- (Lembrete opcional: configurar cron job)

## Como rodar

### 1. API (Backend)

```bash
cd api
npm install
cp .env.example .env   # criar .env com DATABASE_URL
```

Crie `.env`:
```
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/datailer"
JWT_SECRET="sua-chave-secreta"
```

```bash
npm run db:generate
npm run db:push
npm run db:seed      # lava-car teste: admin@lavacar.com / 123456
npm start
```

### 2. Frontend

```bash
npx serve .
# ou abra index.html com Live Server
```

Configure a URL da API em `api.js` (padrão `http://localhost:3000`).

## Fluxo

1. **Lava-car** se cadastra em "Cadastre seu Lava-Car"
2. **Cliente** cria conta e busca lava-cars pela cidade
3. Cliente escolhe serviço, data e horário disponível
4. Sistema envia e-mail de confirmação e notifica o lava-car
5. Lava-car gerencia no painel (concluir/cancelar)

## Estrutura do projeto

```
Datailer/
├── index.html, cliente-*.html, lavacar-*.html   # Páginas
├── style.css, api.js, *.js                      # Frontend
├── api/                                         # Backend
│   ├── server.js
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── config.js
│       ├── mailer.js
│       ├── utils.js
│       └── routes/   # auth, lavacars, horarios, agendamentos, servicos, lavacarAdmin
```
