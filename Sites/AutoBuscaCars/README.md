# AutoBusca 🚗⚡ - Plataforma de Pesquisa, Comparação e Avaliação de Carros

Uma plataforma web responsiva, mobile-first e PWA desenvolvida em **Next.js 14 (App Router)**, **TypeScript** e **Tailwind CSS** para pesquisa unificada, análise de preços de mercado e avaliação inteligente por IA de anúncios de veículos.

---

## 🌟 Principais Funcionalidades

### 1. 🔍 Pesquisa Unificada e Adaptadores de Fontes
- Arquitetura baseada em **Adapters/Connectors** (`src/lib/adapters/`) preparada para integrar marketplaces automotivos (Webmotors, OLX, iCarros, AutoLine).
- **Engine de Deduplicação**: Elimina anúncios repetidos postados na mesma ou em diferentes plataformas.

### 2. 💰 Análise de Preço e Régua de Mercado
- Classificação visual dos anúncios:
  - 🟢 **Excelente preço** (Significativamente abaixo da média)
  - 🔵 **Bom preço** (Abaixo da média)
  - 🟡 **Preço dentro da média** (Compatível com o mercado)
  - 🔴 **Preço elevado** (Acima da média)
- Régua visual de posição do anúncio no espectro de preços (`R$ 100k ─────── [R$ 119.9k] ─────── R$ 140k`).

### 3. ⭐ Score do Veículo (0 a 10) & Avaliação de IA
- Algoritmo multivariável calculando nota geral e 6 sub-notas:
  - Preço
  - Quilometragem x Ano
  - Depreciação por Ano
  - Pacote de Equipamentos
  - Qualidade da Descrição
  - Custo-benefício Geral
- **Análise Semântica de Descrição**: Extração de Pontos Positivos (revisões, único dono, pneus novos, garantia) e Pontos de Atenção (*"Ponto de atenção: o anúncio não informa..."*).
- Distinção transparente entre **DADO INFORMADO PELO ANÚNCIO** vs **ESTIMATIVA DO SISTEMA**.

### 4. 🔥 Melhores Oportunidades ("Carros Baratos")
- Filtro e ordenação dedicada para encontrar veículos com maior desconto relativo em relação à média e índice de oportunidade (0-100).

### 5. ⚖️ Comparador Lado a Lado
- Tabela comparativa responsiva para até 4 veículos com destaques automáticos em verde para os melhores valores (Menor preço, Menor KM, Maior nota, Maior potência).

### 6. ❤️ Favoritos, 🔔 Alertas e 📊 Painel do Usuário
- Sistema de favoritos com salvamento no navegador.
- Gerenciador de alertas de preço personalizados.
- Dashboard com estatísticas do perfil e gráficos de histórico de preço de mercado.

### 7. 📱 Mobile-First & PWA
- Funcionamento otimizado em **iOS, Android e Desktop**.
- Suporte a PWA (`manifest.json`), menu inferior tátil para celular e **Bottom Sheet** animado para os filtros.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Estilização**: Tailwind CSS + Lucide Icons
- **Gráficos**: Recharts
- **Estado**: React Context + LocalStorage API

---

## 🚀 Como Executar o Projeto

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Abrir no navegador
http://localhost:3000
```
