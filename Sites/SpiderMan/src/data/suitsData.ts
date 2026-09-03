import type { Suit, TimelineItem, MultiversePortal } from '../types/suit';

export const SUITS_DATA: Suit[] = [
  {
    id: 'raimi-classic-webbed',
    number: '01',
    name: 'Webbed Suit (Sam Raimi 2002)',
    tagline: 'O Lendário Traje da Trilogia de Tobey Maguire.',
    year: '2002',
    period: 'Spider-Man 1 & 2 Movie (Tobey Maguire)',
    version: 'Earth-96283 Classic Webbed',
    universe: 'Earth-96283',
    origin: 'Desenhado e confeccionado por Peter Parker na Nova York cinematográfica de Sam Raimi após a morte do tio Ben.',
    description: 'Um dos uniformes mais icônicos do cinema mundial. Apresenta teias prateadas em alto relevo 3D moldadas sobre tecido vermelho e azul texturizado, lentes de espelho angular afiadas e teia orgânica.',
    characteristics: [
      'Teias prateadas tridimensionais em alto relevo mecânico',
      'Lentes espelhadas triangulares com armação prateada afiada',
      'Emblema de aranha clássica prateada no peito e aranha vermelha nas costas',
      'Disparadores de teia orgânicos integrados nos pulsos'
    ],
    abilities: [
      'Geração de teia orgânica biológica sem recargas',
      'Força física e resistência de impacto ampliadas',
      'Sentido Aranha apurado para esquiva de projéteis'
    ],
    technology: [
      'Tecido sintético militar de alta densidade texturizado',
      'Lentes de vidro temperado espelhado com reflexo fotônico'
    ],
    trivia: [
      'Foi o primeiro traje do Homem-Aranha a usar teias 3D em alto relevo no cinema.',
      'Tobey Maguire usou teia orgânica diretamente dos pulsos no filme de 2002.'
    ],
    categories: ['ALL', 'CLASSICS', 'LIVE-ACTION', 'PETER'],
    primaryColor: '#E50914',
    accentColor: '#0055FF',
    glowColor: 'rgba(229, 9, 20, 0.8)',
    badgeText: 'RAIMI 2002',
    imageUrl: '/suits/raimi_classic_webbed.png',
    stats: {
      defense: 85,
      speed: 92,
      tech: 65,
      agility: 98,
      stealth: 80
    },
    hotspots: [
      {
        id: 'r1',
        label: 'TEIA 3D RELEVO',
        title: 'Teias Prateadas em Alto Relevo',
        description: 'Teias moldadas em polímero flexível prateado em alto relevo 3D sobre todo o uniforme.',
        x: 50,
        y: 38,
        category: 'armor'
      },
      {
        id: 'r2',
        label: 'LENTES ESPELHADAS',
        title: 'Lentes Triangulares de Espelho',
        description: 'Lentes angulares com superfície espelhada que refletem os prédios de Nova York.',
        x: 50,
        y: 18,
        category: 'lens'
      }
    ],
    suitType: 'classic'
  },
  {
    id: 'advanced-suit-2',
    number: '02',
    name: 'Advanced Suit 2.0',
    tagline: 'O Ápice da Tecnologia de Nova York.',
    year: '2023',
    period: 'Marvel\'s Spider-Man 2 (PS5)',
    version: 'Insomniac Earth-1048 Next-Gen',
    universe: 'Earth-1048',
    origin: 'Evolução do traje Advanced 1.0 criado por Peter com aprimoramentos para lidar com ameaças de nível simbionte.',
    description: 'Conta com tons de vermelho mais vívidos, detalhes em azul marinho refinados e braços robóticos Iron Spider integrados diretamente nas costas para combate dinâmico contra Kraven e Venom.',
    characteristics: [
      'Vermelho mais vívido e azul mais escuro e elegante',
      'Design de aranha branca mais refinado e contínuo',
      'Integrado com 4 braços prateados com tecnologia Iron Spider',
      'Detalhes anatômicos ajustados para alta performance'
    ],
    abilities: [
      'Ataques devastadores com Iron Arms (Garras Mecânicas)',
      'Habilidade de impulso com asas de teia (Web Wings) para voo livre',
      'Sobrecarga elétrica de Bio-Parry em combate'
    ],
    technology: [
      'Asas de teia sob os braços para travessia por correntes de vento',
      'Braços nanotecnológicos retráteis embutidos na aranha traseira'
    ],
    trivia: [
      'Adiciona as Web Wings (Asas de teia) permitindo cruzar Nova York voando.'
    ],
    categories: ['ALL', 'TECHNOLOGY', 'PETER'],
    primaryColor: '#FF0B18',
    accentColor: '#00C4FF',
    glowColor: 'rgba(0, 196, 255, 0.7)',
    badgeText: 'PS5 NEXT-GEN',
    imageUrl: '/suits/advanced_2_classic.png',
    stats: {
      defense: 90,
      speed: 97,
      tech: 96,
      agility: 99,
      stealth: 82
    },
    hotspots: [
      {
        id: 'a2_1',
        label: 'WEB WINGS',
        title: 'Asas de Teia de Alta Velocidade',
        description: 'Membrana aerodinâmica sob os braços permitindo planejar entre correntes de ar térmicas na cidade.',
        x: 68,
        y: 48,
        category: 'armor'
      }
    ],
    suitType: 'advanced'
  },
  {
    id: 'advanced-2-style-1',
    number: '03',
    name: 'Advanced 2.0 (Red & Black Style)',
    tagline: 'Estilo Superior de Alto Impacto Urbano.',
    year: '2023',
    period: 'Marvel\'s Spider-Man 2 (PS5 Style 1)',
    version: 'Earth-1048 Red & Black Armor',
    universe: 'Earth-1048',
    origin: 'Variante de cor tática do Advanced 2.0 combinando vermelho carmesim e preto fosco.',
    description: 'Estética intimidadora inspirada no estilo Superior Spider-Man com contraste profundo entre o vermelho vibrante e as pernas de aranha pretas.',
    characteristics: [
      'Visual em vermelho fosco e preto profundo',
      'Aranha branca central expandida',
      'Tecido tático de alta absorção de energia'
    ],
    abilities: [
      'Furtividade urbana aprimorada à noite',
      'Ataques de combate Iron Arms 2.0'
    ],
    technology: [
      'Revestimento polimérico com absorção de sombras'
    ],
    trivia: [
      'Estilo de cor desbloqueável no jogo Marvel\'s Spider-Man 2 para PS5.'
    ],
    categories: ['ALL', 'TECHNOLOGY', 'PETER'],
    primaryColor: '#E50914',
    accentColor: '#101014',
    glowColor: 'rgba(229, 9, 20, 0.8)',
    badgeText: 'STYLE 1 (RED/BLACK)',
    imageUrl: '/suits/advanced_2_black.png',
    stats: {
      defense: 91,
      speed: 96,
      tech: 96,
      agility: 98,
      stealth: 88
    },
    hotspots: [],
    suitType: 'advanced'
  },
  {
    id: 'advanced-2-style-2',
    number: '04',
    name: 'Advanced 2.0 (Inverted Blue Style)',
    tagline: 'Dinamismo Azul Royal e Vermelho Neon.',
    year: '2023',
    period: 'Marvel\'s Spider-Man 2 (PS5 Style 2)',
    version: 'Earth-1048 Inverted Blue',
    universe: 'Earth-1048',
    origin: 'Estilo alternativo invertendo os tons dominantes para azul royal vibrante com peito vermelho.',
    description: 'Design de alto contraste futurista ideal para travessias aéreas e combate de alta velocidade.',
    characteristics: [
      'Azul royal dominante com detalhes em vermelho carmesim',
      'Lentes brancas angulares ativas'
    ],
    abilities: [
      'Manobras acrobáticas vertiginosas',
      'Impulso com Asas de Teia'
    ],
    technology: [
      'Matriz fotônica de reflexão de luz'
    ],
    trivia: [
      'Homenagem às variações clássicas de cores das HQs dos anos 90.'
    ],
    categories: ['ALL', 'TECHNOLOGY', 'PETER'],
    primaryColor: '#0055FF',
    accentColor: '#E50914',
    glowColor: 'rgba(0, 85, 255, 0.8)',
    badgeText: 'STYLE 2 (BLUE/RED)',
    imageUrl: '/suits/advanced_2_blue.png',
    stats: {
      defense: 89,
      speed: 98,
      tech: 95,
      agility: 99,
      stealth: 78
    },
    hotspots: [],
    suitType: 'advanced'
  },
  {
    id: 'advanced-2-style-3',
    number: '05',
    name: 'Advanced 2.0 (Cyber Gold Style)',
    tagline: 'Inovação Dourada e Amarelo Solar.',
    year: '2023',
    period: 'Marvel\'s Spider-Man 2 (PS5 Style 3)',
    version: 'Earth-1048 Cyber Gold',
    universe: 'Earth-1048',
    origin: 'Versão de alta tecnologia com revestimento amarelo solar e aranha de liga prateada.',
    description: 'Estética brilhante que ostenta poder e tecnologia avançada de isolamento energético.',
    characteristics: [
      'Malha amarelo solar com placas brancas metálicas',
      'Circuitos de energia dourados nas articulações'
    ],
    abilities: [
      'Isolamento contra choques elétricos e calor'
    ],
    technology: [
      'Bateria solar fotovoltaica interna'
    ],
    trivia: [
      'Uma das variações visuais mais chamativas do traje principal.'
    ],
    categories: ['ALL', 'TECHNOLOGY', 'PETER'],
    primaryColor: '#FFB700',
    accentColor: '#FFFFFF',
    glowColor: 'rgba(255, 183, 0, 0.8)',
    badgeText: 'STYLE 3 (CYBER GOLD)',
    imageUrl: '/suits/advanced_2_yellow.png',
    stats: {
      defense: 93,
      speed: 94,
      tech: 98,
      agility: 96,
      stealth: 72
    },
    hotspots: [],
    suitType: 'advanced'
  },
  {
    id: 'superior-suit-red-black',
    number: '06',
    name: 'Superior Suit (Red & Black Armor)',
    tagline: 'A Mente Superior no Corpo do Homem-Aranha.',
    year: '2013',
    period: 'Superior Spider-Man #1',
    version: 'Earth-616 Otto Octavius',
    universe: 'Earth-616',
    origin: 'Criado pelo Doutor Otto Octavius enquanto assumiu o corpo de Peter Parker para se tornar um Aranha mais eficiente e impiedoso.',
    description: 'Design militar agressivo em vermelho fosco e preto. Apresenta lentes pretas assustadoras, garras de titânio nos dedos e tentáculos mecânicos retráteis nas costas.',
    characteristics: [
      'Base preta com aranha peitoral vermelha expansiva estilo aranha-viúva',
      'Lentes escuras de visão tática e infravermelha',
      'Garras afiadas nas pontas das luvas e botas'
    ],
    abilities: [
      'Ataques letais de combate corpo a corpo com garras',
      'Interface direta com Spider-Bots autônomos por toda a cidade'
    ],
    technology: [
      'Nanotecnologia Octavius com braços robóticos dorsais',
      'Sistemas de rastreamento e vigilância global'
    ],
    trivia: [
      'Otto Octavius jurou ser um Homem-Aranha superior a Peter em todas as métricas.'
    ],
    categories: ['ALL', 'TECHNOLOGY', 'CLASSICS', 'PETER'],
    primaryColor: '#E50914',
    accentColor: '#101014',
    glowColor: 'rgba(229, 9, 20, 0.85)',
    badgeText: 'SUPERIOR 2013',
    imageUrl: '/suits/superior_suit_red_black.png',
    stats: {
      defense: 93,
      speed: 94,
      tech: 99,
      agility: 95,
      stealth: 86
    },
    hotspots: [],
    suitType: 'iron'
  },
  {
    id: 'velocity-neon-green',
    number: '07',
    name: 'Velocity Suit (Neon Cyber Style)',
    tagline: 'Supervelocidade e Isolamento Fotônico.',
    year: '2018',
    period: 'Marvel\'s Spider-Man (PS4)',
    version: 'Earth-1048 Velocity Armor',
    universe: 'Earth-1048',
    origin: 'Projetado pela renomada artista de HQs Adi Granov especificamente para o jogo do PlayStation 4.',
    description: 'Armadura cibernética futurista nas cores branco marfim, preto fosco e linhas bioluminescentes verde neon. Desenvolvida para alcançar velocidades supersônicas com proteção fotônica.',
    characteristics: [
      'Corpo branco metálico com aranha central verde neon brilhante',
      'Lentes verdes com visão de varredura térmica',
      'Placas de blindagem aerodinâmicas'
    ],
    abilities: [
      'Carga de impulso cinético supersônico',
      'Resistência a radiação e pulsos eletromagnéticos'
    ],
    technology: [
      'Micro-turbinas cinéticas integradas às pernas e peito'
    ],
    trivia: [
      'Desenhado exclusivamente pela Marvel para o jogo da Insomniac Games.'
    ],
    categories: ['ALL', 'TECHNOLOGY', 'PETER'],
    primaryColor: '#00FF66',
    accentColor: '#FFFFFF',
    glowColor: 'rgba(0, 255, 102, 0.85)',
    badgeText: 'VELOCITY NEON',
    imageUrl: '/suits/velocity_neon_green.png',
    stats: {
      defense: 92,
      speed: 100,
      tech: 97,
      agility: 96,
      stealth: 75
    },
    hotspots: [],
    suitType: 'advanced'
  },
  {
    id: 'superior-suit-dark-red',
    number: '08',
    name: 'Superior Armor (Dark Red & Charcoal)',
    tagline: 'Blindagem Tática e Furtividade Noturna.',
    year: '2023',
    period: 'Marvel\'s Spider-Man 2 (PS5 Style)',
    version: 'Earth-1048 Superior Armor',
    universe: 'Earth-1048',
    origin: 'Variação tática noturna com revestimento em fibra de carbono preto carvão e aranha vermelha carmesim.',
    description: 'Estética intimidadora ideal para operações noturnas e travessias rápidas sem detecção radar.',
    characteristics: [
      'Preto carvão fosco com aranha e linhas em vermelho escuro',
      'Lentes escuras com antirreflexo militar'
    ],
    abilities: [
      'Absorção de rastreamento térmico e sônico',
      'Ataques com garras táticas'
    ],
    technology: [
      'Malha de carbono com absorção de impacto pesado'
    ],
    trivia: [
      'Variação tática inspirada nos trajes mais sombrios dos quadrinhos.'
    ],
    categories: ['ALL', 'TECHNOLOGY', 'PETER'],
    primaryColor: '#CC0000',
    accentColor: '#1A1A1E',
    glowColor: 'rgba(204, 0, 0, 0.8)',
    badgeText: 'DARK ARMOR',
    imageUrl: '/suits/superior_suit_dark_red.png',
    stats: {
      defense: 94,
      speed: 93,
      tech: 96,
      agility: 94,
      stealth: 92
    },
    hotspots: [],
    suitType: 'iron'
  },
  {
    id: 'raimi-black-webbed',
    number: '09',
    name: 'Black Webbed Suit (Spider-Man 3)',
    tagline: 'O Simbionte Sombrio da Trilogia de Sam Raimi.',
    year: '2007',
    period: 'Spider-Man 3 Movie (Tobey Maguire)',
    version: 'Earth-96283 Black Symbiote',
    universe: 'Earth-96283',
    origin: 'O clássico traje de Tobey Maguire infectado pelo simbionte negro alienígena no filme Homem-Aranha 3.',
    description: 'Um dos uniformes mais lendários do cinema. Apresenta o traje clássico Raimi transformado em preto fosco com teias tridimensionais em relevo prateado afiado e aranha peitoral agressiva.',
    characteristics: [
      'Base preta profunda com teias 3D metálicas prateadas em relevo',
      'Emblema de aranha com pernas angulares pontiagudas',
      'Lentes brancas com bordas prateadas angulares agressivas'
    ],
    abilities: [
      'Força física amplificada e agressividade em combate',
      'Geração de teia orgânica negra ilimitada'
    ],
    technology: [
      'Parasita Klyntar orgânico em simbiose com o traje de tecido'
    ],
    trivia: [
      'Marcou a inesquecível fase negra de Peter Parker no filme Homem-Aranha 3 (2007).'
    ],
    categories: ['ALL', 'SYMBIOTE', 'CLASSICS', 'LIVE-ACTION', 'PETER'],
    primaryColor: '#0E0F14',
    accentColor: '#E0E0E0',
    glowColor: 'rgba(255, 255, 255, 0.75)',
    badgeText: 'RAIMI BLACK 2007',
    imageUrl: '/suits/raimi_black_webbed.png',
    stats: {
      defense: 94,
      speed: 95,
      tech: 50,
      agility: 97,
      stealth: 95
    },
    hotspots: [],
    suitType: 'symbiote'
  },
  {
    id: 'anti-venom-suit',
    number: '10',
    name: 'Anti-Venom Suit',
    tagline: 'A Cura Bio-Sintética Alva contra a Escuridão.',
    year: '2023',
    period: 'Marvel\'s Spider-Man 2 (PS5)',
    version: 'Insomniac Earth-1048 Anti-Venom',
    universe: 'Earth-1048',
    origin: 'Nascido da purificação dos resíduos do simbionte no corpo de Peter Parker pelo poder de Martin Li.',
    description: 'Um organismo simbionte purificado e benevolente de cor branca impecável com tentáculos pretos e bioluminescência. Destrói células simbiontes malignas ao toque.',
    characteristics: [
      'Visual branco marfim com tentáculos pretos e aranha angular',
      'Propriedades de cura biológica ativa'
    ],
    abilities: [
      'Ataques devastadores de Anti-Venom Strike & Anti-Venom Bomb',
      'Destruição instantânea da matéria Klyntar maligna'
    ],
    technology: [
      'Organismo simbionte anticorpo livre de consciência maligna'
    ],
    trivia: [
      'Permite a Peter manter poderes de simbionte sem ser corrompido pela escuridão.'
    ],
    categories: ['ALL', 'SYMBIOTE', 'TECHNOLOGY', 'PETER'],
    primaryColor: '#F5F5F7',
    accentColor: '#101014',
    glowColor: 'rgba(255, 255, 255, 0.95)',
    badgeText: 'ANTI-VENOM 2023',
    imageUrl: '/suits/Anti-Venom_Suit_Default_from_MSM2_render.webp',
    stats: {
      defense: 98,
      speed: 95,
      tech: 90,
      agility: 97,
      stealth: 85
    },
    hotspots: [],
    suitType: 'symbiote'
  },
  {
    id: 'symbiote-msm2',
    number: '11',
    name: 'Symbiote Suit (Spider-Man 2)',
    tagline: 'O Hospedeiro Negro da Insomniac.',
    year: '2023',
    period: 'Marvel\'s Spider-Man 2 (PS5)',
    version: 'Insomniac Earth-1048 Symbiote',
    universe: 'Earth-1048',
    origin: 'O simbionte alienígena Klyntar unido a Peter Parker durante os eventos do jogo Marvel\'s Spider-Man 2.',
    description: 'Textura biológica orgânica preta brilhante com aranha branca reluzente cobrindo o peito e ombros. Confere habilidades de combate com tentáculos de força avassaladora.',
    characteristics: [
      'Textura orgânica alienígena preta reflexiva',
      'Tentáculos simbiontes de combate corporal'
    ],
    abilities: [
      'Symbiote Surge & Symbiote Punch',
      'Força física e agressividade ampliadas'
    ],
    technology: [
      'Biomassa Klyntar adaptativa'
    ],
    trivia: [
      'Transforma o estilo de luta de Peter para um combate brutal e focado em força bruta.'
    ],
    categories: ['ALL', 'SYMBIOTE', 'PETER'],
    primaryColor: '#0E0F14',
    accentColor: '#FFFFFF',
    glowColor: 'rgba(255, 255, 255, 0.8)',
    badgeText: 'SYMBIOTE 2023',
    imageUrl: '/suits/Symbiote_Suit_Default_from_MSM2_render.webp',
    stats: {
      defense: 96,
      speed: 93,
      tech: 60,
      agility: 96,
      stealth: 94
    },
    hotspots: [],
    suitType: 'symbiote'
  },
  {
    id: 'venom-host',
    number: '12',
    name: 'Venom (Harry Osborn)',
    tagline: 'O Monstro Simbionte de Nova York.',
    year: '2023',
    period: 'Marvel\'s Spider-Man 2 (PS5)',
    version: 'Insomniac Earth-1048 Venom',
    universe: 'Earth-1048',
    origin: 'Nascido da união completa da entidade Klyntar com Harry Osborn para curar sua doença mortal.',
    description: 'Uma criatura gigantesca de puro músculo simbionte preto com garras afiadas, língua bífida e mandíbula com dentes amarelados. O vilão definitivo.',
    characteristics: [
      'Porte físico colossal com asas simbiontes e garras gigantes',
      'Mandíbula monstruosa com dentes afiados e língua tridimensional'
    ],
    abilities: [
      'Devastação de infraestrutura e saltos de centenas de metros',
      'Invocação de ondas de matéria simbionte'
    ],
    technology: [
      'Consciência de colmeia Klyntar ancestral'
    ],
    trivia: [
      'Pela primeira vez jogável em missões de destruição massiva no jogo do PS5.'
    ],
    categories: ['ALL', 'SYMBIOTE'],
    primaryColor: '#0A0A0F',
    accentColor: '#FFFFFF',
    glowColor: 'rgba(255, 255, 255, 0.9)',
    badgeText: 'VENOM 2023',
    imageUrl: '/suits/Venom_from_MSM2_render.webp',
    stats: {
      defense: 100,
      speed: 88,
      tech: 40,
      agility: 90,
      stealth: 70
    },
    hotspots: [],
    suitType: 'symbiote'
  },
  {
    id: 'scream-symbiote',
    number: '13',
    name: 'Scream (Mary Jane Watson)',
    tagline: 'A Fúria Amarela e Vermelha de Mary Jane.',
    year: '2023',
    period: 'Marvel\'s Spider-Man 2 (PS5)',
    version: 'Insomniac Earth-1048 Scream',
    universe: 'Earth-1048',
    origin: 'Infectada pela semente do simbionte Venom criada para transformar Mary Jane em Scream.',
    description: 'Visual aterrorizante nas cores amarelo solar e vermelho com tentáculos de cabelo vivos de grande alcance.',
    characteristics: [
      'Cabelos de tentáculos simbiontes amarelos e vermelhos',
      'Garras de alta velocidade e grito sônico'
    ],
    abilities: [
      'Ataques à distância com tentáculos de cabelo',
      'Grito sônico paralisante'
    ],
    technology: [
      'Organismo simbionte parasitário Klyntar'
    ],
    trivia: [
      'Chefe de fase emocionante durante a batalha emocional contra Peter Parker.'
    ],
    categories: ['ALL', 'SYMBIOTE'],
    primaryColor: '#FFCC00',
    accentColor: '#E50914',
    glowColor: 'rgba(255, 204, 0, 0.9)',
    badgeText: 'SCREAM 2023',
    imageUrl: '/suits/Scream_from_MSM2_render.webp',
    stats: {
      defense: 92,
      speed: 96,
      tech: 45,
      agility: 97,
      stealth: 80
    },
    hotspots: [],
    suitType: 'symbiote'
  }
];

export const TIMELINE_DATA: TimelineItem[] = [
  {
    id: 't1',
    year: '2002',
    title: 'A Era Clássica do Cinema de Sam Raimi',
    era: 'LIVE ACTION CLASSIC',
    description: 'Tobey Maguire assume o papel do herói com o lendário traje de teias prateadas em 3D e disparadores biológicos orgânicos.',
    suitId: 'raimi-classic-webbed',
    highlightSuitName: 'Webbed Suit (Sam Raimi)',
    keyEvents: [
      'Estreia histórica nos cinemas em 2002',
      'Teias prateadas moldadas em alto relevo 3D',
      'Teia orgânica gerada diretamente dos pulsos'
    ],
    color: '#E50914'
  },
  {
    id: 't2',
    year: '2007',
    title: 'A Saga do Simbionte Sombrio de Raimi',
    era: 'SYMBIOTE ERA',
    description: 'Em Homem-Aranha 3, o organismo alienígena negro infecta o traje clássico de Tobey Maguire, amplificando sua agressividade.',
    suitId: 'raimi-black-webbed',
    highlightSuitName: 'Black Webbed Suit',
    keyEvents: [
      'Transformação do uniforme clássico em preto fosco',
      'Teias prateadas sobre o fundo negro alienígena',
      'Origem do vilão Venom nos cinemas'
    ],
    color: '#FFFFFF'
  },
  {
    id: 't3',
    year: '2013',
    title: 'A Mente Superior de Octavius',
    era: 'SUPERIOR ERA',
    description: 'Otto Octavius assume o manto do Aranha construindo uma armadura tática militar em vermelho e preto com tentáculos nanotecnológicos.',
    suitId: 'superior-suit-red-black',
    highlightSuitName: 'Superior Suit',
    keyEvents: [
      'Estreia na aclamada saga Superior Spider-Man #1',
      'Lentes escuras táticas com visão infravermelha',
      'Rede de Spider-Bots autônomos por toda Nova York'
    ],
    color: '#E50914'
  },
  {
    id: 't4',
    year: '2018',
    title: 'Armaduras Futuristas & Velocidade Neon',
    era: 'INSOMNIAC TECH ERA',
    description: 'A Insomniac Games introduz a armadura Velocity Suit com supervelocidade supersônica e luzes neon fotônicas.',
    suitId: 'velocity-neon-green',
    highlightSuitName: 'Velocity Suit (Neon)',
    keyEvents: [
      'Design exclusivo criado pelo artista Adi Granov',
      'Propulsão cinética para velocidade supersônica',
      'Blindagem fotônica contra radiação'
    ],
    color: '#00FF66'
  },
  {
    id: 't5',
    year: '2023+',
    title: 'Next-Gen PS5: A Ameaça Simbionte & Anti-Venom',
    era: 'NEXT-GEN ERA',
    description: 'Peter Parker ganha as Asas de Teia (Web Wings), o traje Anti-Venom benevolente e combate Venom e Scream.',
    suitId: 'advanced-suit-2',
    highlightSuitName: 'Advanced 2.0 & Anti-Venom',
    keyEvents: [
      'Introdução das Asas de Teia (Web Wings)',
      'Nascimento do traje Anti-Venom de cura biológica',
      'Combate contra o colosso Venom no PS5'
    ],
    color: '#00C4FF'
  }
];

export const MULTIVERSE_PORTALS: MultiversePortal[] = [
  {
    id: 'earth-96283',
    heroName: 'Peter Parker (Tobey Maguire)',
    alterEgo: 'Spider-Man Trilogia Raimi',
    universe: 'Earth-96283',
    earthCode: '96283',
    tagline: 'O Homem-Aranha que marcou uma geração nos cinemas.',
    quote: 'Não importa o que venha pela frente, nós sempre temos uma escolha. Meu tio Ben me ensinou isso.',
    description: 'O Homem-Aranha da inesquecível trilogia dirigida por Sam Raimi. Possui teia orgânica, lentes espelhadas e enfrentou o Duende Verde, Doutor Octopus, Homem de Areia e Venom.',
    suitId: 'raimi-classic-webbed',
    primaryColor: '#E50914',
    accentColor: '#0055FF',
    portalParticleColor: '#FF2A3B',
    traits: ['Teia Orgânica Biológica', 'Resistência Física Extrema', 'Coração e Heroísmo Impecáveis'],
    signatureWeapon: 'Disparadores de Teia Biológicos Orgânicos'
  },
  {
    id: 'earth-1048',
    heroName: 'Peter Parker (Insomniac)',
    alterEgo: 'Spider-Man Advanced 2.0',
    universe: 'Earth-1048',
    earthCode: '1048',
    tagline: 'O Ápice da Tecnologia de Nova York.',
    quote: 'Se você quer salvar a cidade, precisa ser melhor. Hoje à noite nós somos melhores.',
    description: 'O herói veterano dos jogos de PlayStation. Utiliza tecnologia de ponta, braços nanotecnológicos de titânio, asas de teia para voo e o poder do simbionte Anti-Venom.',
    suitId: 'advanced-suit-2',
    primaryColor: '#FF0B18',
    accentColor: '#00C4FF',
    portalParticleColor: '#00C4FF',
    traits: ['Asas de Teia Web Wings', 'Garras Iron Arms 2.0', 'Anti-Venom Bio-Sintético'],
    signatureWeapon: 'Web Wings e Garras Nanotecnológicas'
  },
  {
    id: 'earth-616',
    heroName: 'Otto Octavius',
    alterEgo: 'Superior Spider-Man',
    universe: 'Earth-616',
    earthCode: '616',
    tagline: 'Justiça Implacável e Tecnologia Superior.',
    quote: 'Eu sou Otto Octavius. Eu sou o Homem-Aranha Superior!',
    description: 'O Doutor Octopus no corpo do Homem-Aranha. Luta contra o crime com arrogância genial, exército de robôs Spider-Bots e garras letais.',
    suitId: 'superior-suit-red-black',
    primaryColor: '#E50914',
    accentColor: '#101014',
    portalParticleColor: '#E50914',
    traits: ['Genialidade de Otto Octavius', 'Rede de Spider-Bots', 'Garras de Titânio Letais'],
    signatureWeapon: 'Spider-Bots e Tentáculos Nanotecnológicos'
  },
  {
    id: 'earth-symbiote',
    heroName: 'Entidade Klyntar / Venom',
    alterEgo: 'O Hospedeiro Negro',
    universe: 'Earth-1048 Klyntar',
    earthCode: 'KLYNTAR',
    tagline: 'Nós Somos Venom.',
    quote: 'Nós vamos curar o mundo.',
    description: 'A entidade alienígena Klyntar capaz de se fundir a hospedeiros criando criaturas de força assustadora e regeneração ilimitada.',
    suitId: 'venom-host',
    primaryColor: '#0A0A0F',
    accentColor: '#FFFFFF',
    portalParticleColor: '#FFFFFF',
    traits: ['Força Colossal de Destruição', 'Asas e Tentáculos de Matéria Viva', 'Regeneração Instantânea'],
    signatureWeapon: 'Biomassa Simbionte e Mandíbula Colossal'
  }
];
