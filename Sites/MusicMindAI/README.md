# MusicMind AI 🎧🤖

> **Aplicação Desktop & Web Moderna powered by Artificial Intelligence para organização, curadoria e reestruturação automática do YouTube Music.**

MusicMind AI é um sistema completo desenvolvido sob os princípios de **Clean Architecture**, **SOLID**, **Repository Pattern** e **Design System Premium inspirado no Spotify Desktop**. O software analisa cada faixa da sua biblioteca do YouTube Music usando modelos de linguagem da OpenAI (GPT-4o / GPT-4o-mini) ou motor de regras heurísticas de alta precisão para categorizar, agrupar, eliminar duplicadas, gerar capas minimalistas e personalizar suas playlists sem intervenção manual.

---

## 🌟 Principais Funcionalidades

### 1. 🔐 Autenticação Google OAuth2 Permanente
- Conexão direta com sua conta Google / YouTube Music.
- Armazenamento local seguro dos tokens de acesso.
- Garantia de acesso contínuo ("Nunca solicitar login novamente").

### 2. 📊 Dashboard Analítico Avançado (Estilo Spotify Desktop)
- Indicadores globais: Quantidade de playlists, músicas, artistas, álbuns e tempo total de áudio.
- Tops interativos: Artistas mais ouvidos, gêneros predominantes, décadas e idiomas.
- Alertas proativos: Detecção imediata de playlists desorganizadas e músicas duplicadas.
- Gráficos visuais (Recharts): Distribuição por gênero (Pie Chart), concentração por artista, linha do tempo por década e evolução temporal.

### 3. 🤖 Inteligência Artificial Curadora & Classificação Multidimensionada
A IA analisa individualmente cada música identificando:
- **Gênero & Subgênero**: Pop, Rock, Sertanejo, MPB, Eletrônica, Lo-fi, Clássica, etc.
- **Humor (Mood)**: Energético, Romântica, Motivado, Nostálgico, Épico, Relaxar, Feliz, Triste.
- **Energia & BPM**: Baixa, Média, Alta e faixa de velocidade BPM.
- **Tipo de Voz / Performance**: Masculina, Feminina, Banda, Instrumental, Acústica, Remix, Ao Vivo, Lo-fi, Cover.
- **Temas Contextuais**: Viagem, Academia, Relaxar, Estudar, Dormir, Festa, Romântica, Motivação, Anime, Filme, Game, Nostalgia.

### 4. 🛡️ Organização Automática com Regra de Segurança Absoluta
- Criador inteligente de playlists temáticas (🎧 Academia, 🚗 Viagem, 🌙 Madrugada, 😌 Relaxar, 💻 Trabalho, 📚 Estudos, 🎉 Festa, ❤️ Românticas, 🎸 Rock, 🎤 Pop, 🎧 Eletrônicas, 🔥 Descobertas, 🇧🇷 Brasileiras, 2000, 2010, 2020, etc.).
- **Regras de Ouro**:
  1. Nunca apagar playlists existentes.
  2. Nunca excluir músicas da biblioteca.
  3. **Sempre solicitar confirmação antes de mover qualquer faixa**, exibindo uma **Modal de Prévia Detalhada** (ex: `Playlist Academia: +18 músicas, -4 músicas. Confirmar?`).

### 5. ✏️ Renomeação Inteligente & Descrições IA
- Identifica nomes genéricos ("Playlist 1", "Músicas", "Legal", "teste") e sugere títulos expressivos e envolventes.
- Gera automaticamente descrições elegantes para cada playlist (ex: *"A melhor seleção de rock nacional para viagens longas."*).

### 6. 🎨 Gerador de Capas Modernas (Spotify Style)
- Cria artes exclusivas para playlists nos estilos Neon, Minimalista, Dark Gradient e Cyberpunk.
- Processamento nativo em Pillow e SVG Canvas.

### 7. 🔍 Detector de Músicas Duplicadas
- Identifica faixas repetidas ou versões remasterizadas.
- Apresenta comparação lado a lado de duração, álbum e qualidade.
- Permite selecionar com 1 clique qual versão manter.

### 8. 🔄 Backup Completo & Registro de Auditoria com Undo
- Exportação completa da biblioteca para formatos **JSON** e **CSV**.
- Histórico cronológico completo de ações (Quem alterou, Quando, O que mudou).
- **Botão Desfazer (Undo)** com 1 clique para reverter qualquer ação passada instantaneamente.

### 9. 📻 12 Modos Especiais de Ouvir com IA
Quick launcher para atmosferas sob medida:
- Modo DJ, Modo Descobertas, Modo Nostalgia, Modo Festa, Modo Relaxar, Modo Chuva, Modo Road Trip, Modo Gamer, Modo Café, Modo Escritório, Modo Programação, Modo Estudos.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** + **TypeScript**
- **Vite** (Bundler ultrarrápido)
- **TailwindCSS** + Glassmorphism personalizado
- **Framer Motion** + animations
- **Recharts** (Visualização gráfica interativa)
- **Lucide Icons**

### Backend
- **Python 3.14+**
- **FastAPI** (REST API assíncrona)
- **SQLAlchemy 2.0** + **SQLite** (Arquitetura preparada para PostgreSQL)
- **Pydantic v2** (Validação de schemas)
- **OpenAI GPT-4o / GPT-4o-mini** (Classificação IA & Embeddings)
- **ytmusicapi** (Integração YouTube Music)
- **Pillow** (Processador gráfico de capas)
- **Pandas** (Exportação de planilhas CSV)

---

## 📁 Estrutura de Arquivos (Clean Architecture)

```
MusicMindAI/
├── backend/
│   ├── app/
│   │   ├── domain/           # Entidades SQLAlchemy e Schemas Pydantic
│   │   ├── infrastructure/   # Conexão DB, Adapters YTMusic e OpenAI API
│   │   ├── services/         # Casos de uso (CoverGen, Duplicates, Backup, AI)
│   │   └── api/
│   │       └── routers/      # Rotas REST (/auth, /dashboard, /ai, /playlists...)
│   ├── tests/                # Testes automatizados com unittest / pytest
│   ├── requirements.txt
│   └── main.py               # Ponto de entrada FastAPI
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes de layout (Sidebar, Header, PlayerBar)
│   │   ├── views/            # Telas da aplicação (Dashboard, AIOrganizer, Playlists...)
│   │   ├── services/         # Cliente API Fetch
│   │   └── types/            # Definições TypeScript
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Iniciar o Backend (FastAPI)
```bash
cd backend
python main.py
```
O servidor estará rodando em `http://localhost:8000`. A documentação interativa das rotas pode ser acessada em `http://localhost:8000/docs`.

### 2. Executar os Testes do Backend
```bash
$env:PYTHONPATH="backend"; python backend/tests/run_tests.py
```

### 3. Iniciar o Frontend (React + TypeScript)
```bash
cd frontend
npm run dev
```
Acesse a aplicação em `http://localhost:3000`.

---

## 📄 Licença
Desenvolvido com excelência técnica para curadoria inteligente de áudio.
