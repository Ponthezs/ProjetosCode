# 🎮 Bot Discord — Game Deals & Free Games

Um bot completo, robusto e escalável para **Discord**, especializado em monitorar lojas digitais de jogos (Epic Games, Steam, GOG, EA Store, PlayStation Store, Xbox Store, Ubisoft Store) e publicar automaticamente promoções, grandes descontos e jogos que ficaram 100% gratuitos.

Contém também um **Painel Web Administrativo** responsivo para monitorar status das lojas, métricas de ofertas e alterar configurações em tempo real.

---

## 🌟 Principais Recursos

- 🎁 **Detecção de Jogos Grátis (R$ 0,00)**: Notificações automáticas para resgate imediato por tempo limitado.
- 🔥 **Alertas de Grandes Promoções (>= 50%)**: Envio formatado com preço original, preço promocional e percentual de desconto.
- 💎 **Ofertas Imperdíveis (>= 80%)**: Destaque especial para descontos extremos.
- 🚫 **Deduplicação de Ofertas**: Utiliza banco de dados SQLite/PostgreSQL para garantir que a mesma oferta nunca seja repetida no canal.
- 🏪 **Arquitetura de Lojas Modular**: Suporte para Epic Games Store, Steam, GOG, EA, PlayStation, Xbox e Ubisoft, com isolamento de erros.
- ⚙️ **Comandos Slash Integrados**: `/setup`, `/promocoes`, `/gratis`, `/ofertas`, `/steam`, `/epic`, `/ea`, `/playstation`, `/xbox`, `/ubisoft`, `/gog`, `/config`, `/test` e `/status`.
- 📊 **Painel Web Administrativo**: Interface responsiva construída com FastAPI e HTML5/CSS3.
- 🐳 **Pronto para Docker**: Configuração simplificada via Docker Compose.

---

## 🚀 Como Funciona a Arquitetura

```text
                    BOT DISCORD / SCHEDULER
                               │
       ┌───────────────────────┼───────────────────────┐
       ↓                       ↓                       ↓
  EPIC STORE                 STEAM                    GOG / EA / PSN / XBOX / UBISOFT
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ↓
                      SISTEMA DE OFERTAS
                               │
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
          GRÁTIS           DESCONTO          OFERTAS
              │                │                │
              └────────────────┼────────────────┘
                               ↓
                        BANCO DE DADOS (SQLite / PostgreSQL)
                               ↓
                        DISCORD EMBEDS
                               ↓
              🎁 #jogos-gratis
              🔥 #promocoes
              💎 #ofertas-imperdiveis
```

---

## 🛠️ Passo a Passo para Configuração

### 1. Criar o Bot no Discord Developer Portal

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique em **New Application** e escolha um nome (ex: `GameDealsBot`).
3. Vá no menu lateral **Bot** ➔ Clique em **Reset Token** e copie o seu **Token do Bot**.
4. Ative as seguintes **Privileged Gateway Intents** se necessário: `Message Content Intent`.
5. Vá no menu **OAuth2 ➔ URL Generator**:
   - Selecione os escopos: `bot` e `applications.commands`.
   - Marque as permissões: `Send Messages`, `Embed Links`, `Attach Files`, `Read Message History`, `Use Slash Commands`.
   - Copie o URL gerado e abra no navegador para convidar o bot ao seu servidor.

---

### 2. Configurar o Arquivo `.env`

Crie uma cópia do arquivo `.env.example` nomeada como `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
DISCORD_TOKEN=seu_token_do_discord_aqui
CLIENT_ID=seu_client_id_aqui
DATABASE_URL=sqlite+aiosqlite:///./data/game_deals.db
CHECK_INTERVAL_MINUTES=30
MIN_DISCOUNT=50
EXTREME_DISCOUNT=80
PREFERRED_CURRENCY=BRL

WEB_HOST=0.0.0.0
WEB_PORT=8000
SECRET_KEY=sua_chave_secreta_aqui
```

---

### 3. Instalação e Execução Local

#### Requisitos
- Python 3.10 ou superior.

#### Passo a passo

1. Crie um ambiente virtual (opcional, mas recomendado):
   ```bash
   python -m venv venv
   # No Windows:
   venv\Scripts\activate
   # No Linux/Mac:
   source venv/bin/activate
   ```

2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

3. Inicie o sistema:
   ```bash
   python main.py
   ```

O bot se conectará ao Discord e o Painel Web estará disponível em: `http://localhost:8000`.

---

### 4. Executando com Docker

Se preferir rodar em contêiner Docker:

```bash
docker compose up -d
```

Para visualizar os logs:
```bash
docker compose logs -f
```

---

### 5. Executando Testes Automatizados

O projeto possui suíte de testes com `pytest`:

```bash
pytest
```

---

## 🤖 Comandos Slash no Discord

| Comando | Descrição | Permissão |
| :--- | :--- | :--- |
| `/setup` | Configura os canais do servidor para cada categoria de oferta | Administrador |
| `/gratis` | Lista os jogos atualmente gratuitos nas lojas | Todos |
| `/promocoes` | Lista as promoções ativas com desconto configurável | Todos |
| `/ofertas` | Lista ofertas imperdíveis (80%+ OFF) | Todos |
| `/steam` | Mostra promoções ativas na Steam | Todos |
| `/epic` | Mostra promoções ativas na Epic Games Store | Todos |
| `/ea` | Mostra promoções ativas na EA Store | Todos |
| `/playstation` | Mostra promoções ativas na PlayStation Store | Todos |
| `/xbox` | Mostra promoções ativas na Xbox Store | Todos |
| `/ubisoft` | Mostra promoções ativas na Ubisoft Store | Todos |
| `/gog` | Mostra promoções ativas na GOG | Todos |
| `/config` | Altera o desconto mínimo padrão do servidor | Administrador |
| `/test` | Envia um embed de promoção de teste para validar permissões | Administrador |
| `/status` | Exibe estatísticas de monitoramento e status por loja | Todos |

---

## 🏪 Como Adicionar Uma Nova Loja

A arquitetura utiliza o padrão **Strategy / Interface**:

1. Crie um novo arquivo em `stores/` (ex: `stores/nuuvem.py`).
2. Herde da classe `BaseStore` e implemente os métodos:

```python
from stores.base_store import BaseStore, DealDTO

class NuuvemStore(BaseStore):
    store_id = "nuuvem"
    store_name = "Nuuvem"

    async def fetch_deals(self) -> list[DealDTO]:
        # Implementar consulta de ofertas
        return []

    async def fetch_free_games(self) -> list[DealDTO]:
        # Implementar consulta de jogos grátis
        return []
```

3. Adicione a nova loja na lista em `stores/manager.py`:

```python
self.stores.append(NuuvemStore())
```

---

## 📄 Licença

Este projeto é de código aberto sob a licença [MIT](LICENSE).
