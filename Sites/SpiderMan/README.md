# 🕷️ Spider-Man: The Evolution of the Suit — Experiência Cinematográfica Interativa

Uma experiência web premium, imersiva e cinematográfica inspirada no universo do **Homem-Aranha** e no **Aranhaverso**. O site combina navegação por cenas, visualizador de uniformes 360° com hotspots interativos no HUD, portais do multiverso, simulador de voo/balanço entre prédios em Canvas 3D e sintetizador de áudio via Web Audio API.

---

## 🌟 Principais Funcionalidades

- **🎬 Abertura Cinematográfica (`HeroIntro.tsx`)**:
  - Reflexos volumétricos (Searchlights), neblina noturna e silhuetas de arranha-céus.
  - Animação de disparos de teia ao entrar na experiência.

- **🛡️ Galeria dos Uniformes (`SuitGallery.tsx` & `SuitCanvasVisual.tsx`)**:
  - Catálogo de uniformes icônicos (Classic 1962, Symbiote, Iron Spider, Advanced 1.0/2.0, Miles Morales, Noir, Spider-Punk, Anti-Venom, Raimi Black Webbed, etc.).
  - Filtros por categoria: `CLÁSSICOS`, `TECNOLOGIA`, `SIMBIONTES`, `MULTIVERSO`, `MILES MORALES`, `PETER PARKER`, `LIVE ACTION` e `ANIMAÇÃO`.
  - Palco 3D com pedestal holográfico, estatísticas de combate (Defesa, Velocidade, Tecnologia, Agilidade, Furtividade) e ficha técnica.

- **🔍 Inspetor de Uniforme 360° (`SuitInspector.tsx`)**:
  - Visualização tridimensional com controle de rotação e troca de ângulo (frente e costas).
  - Hotspots interativos com explicações táticas (Lentes expressivas, Emblema frontal, Disparadores de teia, Armadura).

- **🧭 Linha do Tempo da Evolução (`Timeline.tsx`)**:
  - Eixo cronológico interativo desde 1962 (Steve Ditko) até 2023+ (Games Next-Gen & Aranhaverso).

- **🌀 Portais do Multiverso (`MultiversePortals.tsx`)**:
  - Portais interdimensionais animados para Earth-616 (Peter), Earth-1610 (Miles), Earth-928 (2099), Earth-90214 (Noir) e Earth-138 (Spider-Punk).

- **🏙️ Simulador 3D "Swing Through the City" (`CitySwingScene.tsx`)**:
  - Simulador de voo entre arranha-céus com física de câmera, partículas de velocidade e seleção de aceleração (Normal, Turbo, Nitro).

- **📊 Ferramenta de Comparação (`SuitCompare.tsx`)**:
  - Comparação direta de dois uniformes lado a lado com gráfico em barras de atributos.

- **🔊 Efeitos Sonoros Synthesizer (`audioService.ts`)**:
  - Efeitos procedurais sintetizados em tempo real via Web Audio API (som de teia *Thwip!*, rotação de trajes, cliques táticos e abertura de portais).

- **💥 Efeitos de Quadrinhos & Cursor de Mira (`CustomCursor.tsx` & `ComicFXOverlay.tsx`)**:
  - Retículo de mira cibernético e popups de ação no clique (*THWIP!*, *ZAP!*, *BOOM!*).

---

## 🛠️ Tecnologias Utilizadas

- **Core**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS v4 + Design Tokens Neon + Glassmorphism
- **Animações**: Framer Motion + Canvas 2D/3D Engine
- **Áudio**: Web Audio API Procedural Synthesizer
- **Tipografia**: Google Fonts (`Outfit`, `Rajdhani`)
- **Ícones**: Lucide React

---

## 🚀 Como Rodar o Projeto

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Gerar build de produção**:
   ```bash
   npm run build
   ```
