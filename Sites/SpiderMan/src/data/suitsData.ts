import type { Suit, TimelineItem, MultiversePortal } from '../types/suit';

export const SUITS_DATA: Suit[] = [
  {
    id: 'classic-suit',
    number: '01',
    name: 'Classic Suit',
    tagline: 'O Traje Lendário onde tudo começou.',
    year: '1962',
    period: 'Primeira Aparição - Amazing Fantasy #15',
    version: 'Earth-616 Classic',
    universe: 'Earth-616',
    origin: 'Criado por Peter Parker com malha reforçada para ocultar a sua identidade após a picada da aranha radioativa.',
    description: 'O uniforme icônico azul e vermelho desenhado por Steve Ditko. Tornou-se o símbolo definitivo do Homem-Aranha, estabelecendo o padrão visual com a teia estilizada e os disparadores de teia mecânicos.',
    characteristics: [
      'Cores clássicas vermelho, azul e detalhes em preto',
      'Máscara com lentes oculares de ajuste de foco',
      'Disparadores de teia mecânicos duplos no pulso',
      'Emblema de aranha clássica bordado no peito e nas costas'
    ],
    abilities: [
      'Agilidade acrobática incomparável',
      'Aderência à superfícies verticais',
      'Sentido Aranha apurado',
      'Resistência de impacto amplificada'
    ],
    technology: [
      'Fluido de teia sintético de alta resistência mecânica',
      'Disparadores com seletor de padrão de jato (linha, rede, esfera)',
      'Rastreadores Aranha de rádio (Spider-Tracers)',
      'Cinto de utilidades com projetor de sinal aranha'
    ],
    trivia: [
      'Originalmente desenhado com teias sob os braços por Steve Ditko em 1962.',
      'O tom azul das calças era usado como iluminação para a cor preta nas HQs originais.',
      'É o traje mais recriado e adaptado da história dos quadrinhos.'
    ],
    categories: ['ALL', 'CLASSICS', 'PETER'],
    primaryColor: '#E50914',
    accentColor: '#0055FF',
    glowColor: 'rgba(229, 9, 20, 0.6)',
    badgeText: 'ORIGIN 1962',
    stats: {
      defense: 65,
      speed: 85,
      tech: 70,
      agility: 98,
      stealth: 75
    },
    hotspots: [
      {
        id: 'c1',
        label: 'LENTES OCULARES',
        title: 'Lentes Expressivas',
        description: 'Lentes flexíveis que acompanham as expressões faciais e ajustam o foco de visão para rajadas de luz ou escuridão.',
        x: 50,
        y: 18,
        category: 'lens'
      },
      {
        id: 'c2',
        label: 'SÍMBOLO ARANHA',
        title: 'Emblema Frontal',
        description: 'Desenho icônico em formato de aranha estilizada bordada com fibra reforçada sobre o peito.',
        x: 50,
        y: 40,
        category: 'emblem'
      },
      {
        id: 'c3',
        label: 'DISPARADORES DE TEIA',
        title: 'Shooters Mecânicos',
        description: 'Mecanismo acionado por pressão dupla da palma da mão, capaz de disparar teia sintética pressurizada.',
        x: 28,
        y: 62,
        category: 'shooter'
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
      'Habilidade de impulso com assas de teia (Web Wings) para voo livre',
      'Sobrecarga elétrica de Bio-Parry em combate',
      'Super aceleração entre prédios'
    ],
    technology: [
      'Asas de teia sob os braços para travessia por correntes de vento',
      'Braços nanotecnológicos retráteis embutidos na aranha traseira',
      'Sensores biométricos conectados aos sinais de Miles Morales',
      'Liga polimérica contra cortes e mordidas de simbionte'
    ],
    trivia: [
      'Adiciona as Web Wings (Asas de teia) permitindo cruzar Nova York voando.',
      'Projetado especificamente para tirar proveito da velocidade de carregamento do SSD do PS5.'
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
      },
      {
        id: 'a2_2',
        label: 'IRON ARMS 2.0',
        title: 'Interface de Garras Mecânicas',
        description: 'Conectores dorsais que estendem 4 garras de titânio articuladas durante combate pesado.',
        x: 50,
        y: 35,
        category: 'tech'
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
      'Lentes brancas angulares ativas',
      'Placas de armadura no peito'
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
      'Isolamento contra choques elétricos e calor',
      'Emissão de pulso luminoso'
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
    id: 'raimi-black-webbed',
    number: '06',
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
      'Geração de teia orgânica negra ilimitada',
      'Resistência extrema a impactos'
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
    number: '07',
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
      'Propriedades de cura biológica ativa',
      'Tentáculos bio-sintéticos de destruição de simbiontes'
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
    number: '08',
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
      'Tentáculos simbiontes de combate corporal',
      'Lentes brancas angulares agressivas'
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
    id: 'symbiote-suit',
    number: '09',
    name: 'Symbiote Suit Classic',
    tagline: 'A Força Negra do Espaço Profundo.',
    year: '1984',
    period: 'Secret Wars #8',
    version: 'Alien Symbiote (Klyntar)',
    universe: 'Earth-616',
    origin: 'Adquirido por Peter Parker no planeta Mundo de Guerras (Battleworld) durante o evento Guerras Secretas.',
    description: 'Um organismo simbionte alienígena vivo que responde aos pensamentos de Peter. Concede força sobre-humana amplificada, teia orgânica infinita e capacidade de alterar a forma e roupas à vontade.',
    characteristics: [
      'Estética inteiramente negra com emblema de aranha branca expandida',
      'Propriedades metamórficas de mudança de tecido',
      'Ausência de disparadores mecânicos'
    ],
    abilities: [
      'Geração de teia orgânica ilimitada das costas das mãos',
      'Força física amplificada em até 300%'
    ],
    technology: [
      'Biocombinação viva da raça Klyntar'
    ],
    trivia: [
      'A ideia original do traje preto veio de um fã chamado Randy Schueller.'
    ],
    categories: ['ALL', 'CLASSICS', 'SYMBIOTE', 'PETER'],
    primaryColor: '#12131C',
    accentColor: '#FFFFFF',
    glowColor: 'rgba(255, 255, 255, 0.7)',
    badgeText: 'ALIEN KLYNTAR',
    stats: {
      defense: 88,
      speed: 92,
      tech: 50,
      agility: 95,
      stealth: 98
    },
    hotspots: [],
    suitType: 'symbiote'
  },
  {
    id: 'iron-spider',
    number: '10',
    name: 'Iron Spider',
    tagline: 'Engenharia Stark de Nível Militar.',
    year: '2006',
    period: 'Civil War #536 / MCU Avengers',
    version: 'Stark Nanotech Armor',
    universe: 'Earth-616 / Earth-199999',
    origin: 'Construído por Tony Stark para Peter Parker antes dos eventos da Guerra Civil dos super-heróis.',
    description: 'Armadura cibernética de alta tecnologia criada com fibra de metal líquido e nanotecnologia Stark. Equipado com braços mecânicos Walandos articulados, HUD tático avançado e sistemas de suporte à vida.',
    characteristics: [
      'Cores vermelho carmesim e dourado metálico estilo Homem de Ferro',
      '4 garras mecânicas articuladas nas costas (Walandos)',
      'Blindagem de malha nanotecnológica à prova de balas'
    ],
    abilities: [
      'Garras dorsais usadas para escalada, ataque e defesa',
      'Voo limitado com jatos estabilizadores micro-pulse'
    ],
    technology: [
      'Nanotecnologia ativada em segundos através do reator Arc'
    ],
    trivia: [
      'Nos quadrinhos originais o traje possuía apenas 3 braços mecânicos; no cinema ganhou 4.'
    ],
    categories: ['ALL', 'TECHNOLOGY', 'PETER', 'LIVE-ACTION'],
    primaryColor: '#FF1E27',
    accentColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.8)',
    badgeText: 'STARK TECH 2006',
    stats: {
      defense: 96,
      speed: 90,
      tech: 99,
      agility: 92,
      stealth: 70
    },
    hotspots: [],
    suitType: 'iron'
  },
  {
    id: 'advanced-suit-1',
    number: '11',
    name: 'Advanced Suit 1.0',
    tagline: 'Inovação Científica do Doutor Octavius.',
    year: '2018',
    period: 'Marvel\'s Spider-Man (PS4)',
    version: 'Insomniac Earth-1048',
    universe: 'Earth-1048',
    origin: 'Desenvolvido por Peter Parker nos laboratórios da Octavius Industries para substituir o traje clássico danificado.',
    description: 'Destaque pela grande aranha branca reforçada em fibra de carbono. Combina proteção contra impactos com flexibilidade máxima, otimizando o envio de energia motora aos músculos de Peter.',
    characteristics: [
      'Aranha branca arrojada cobrindo peito e costas',
      'Painéis em azul flexível sintético e luvas reforçadas',
      'Botas de borracha isolante tática para escalada urbana'
    ],
    abilities: [
      'Geração de impulso de teia focado (Web Blossom)',
      'Absorção de choque cinético aprimorada'
    ],
    technology: [
      'Fibra de carbono flexível nos pontos de articulação'
    ],
    trivia: [
      'Estreou como a imagem de marca oficial do jogo exclusivo de PlayStation 4 em 2018.'
    ],
    categories: ['ALL', 'TECHNOLOGY', 'PETER'],
    primaryColor: '#E62429',
    accentColor: '#FFFFFF',
    glowColor: 'rgba(255, 255, 255, 0.8)',
    badgeText: 'INSOMNIAC 2018',
    stats: {
      defense: 82,
      speed: 91,
      tech: 92,
      agility: 96,
      stealth: 80
    },
    hotspots: [],
    suitType: 'advanced'
  },
  {
    id: 'spider-2099',
    number: '12',
    name: 'Spider-Man 2099',
    tagline: 'O Protetor Futurista de Nueva York.',
    year: '1992',
    period: 'Spider-Man 2099 #1 / Across the Spider-Verse',
    version: 'Earth-928 Miguel O\'Hara',
    universe: 'Earth-928',
    origin: 'Criado pelo geneticista Miguel O\'Hara no ano de 2099 após ter seu código genético mesclado com DNA de aranha.',
    description: 'Feito com moleculagem instável de alta tecnologia do futuro. Apresenta uma máscara assustadora de caveira de aranha, garras retráteis nos dedos, capa de teia de luz plana (Web Glider) e estética cibernética impressionante.',
    characteristics: [
      'Tecido azul metálico com estampas vermelhas em formato de caveira-aranha',
      'Capa posterior de teia de matéria leve (Light-Byte)'
    ],
    abilities: [
      'Visão acelerada e hipersensorial cibernética',
      'Geração de dublês de sombra em movimento ultrarrápido'
    ],
    technology: [
      'Uniforme confeccionado em molécula instável indestrutível'
    ],
    trivia: [
      'Foi o líder da Sociedade Aranha no filme de animação Homem-Aranha: Através do Aranhaverso.'
    ],
    categories: ['ALL', 'TECHNOLOGY', 'MULTIVERSE', 'ANIMATION'],
    primaryColor: '#0A1B3A',
    accentColor: '#FF003C',
    glowColor: 'rgba(255, 0, 60, 0.9)',
    badgeText: 'FUTURE 2099',
    stats: {
      defense: 94,
      speed: 99,
      tech: 98,
      agility: 95,
      stealth: 84
    },
    hotspots: [],
    suitType: '2099'
  },
  {
    id: 'miles-morales-suit',
    number: '13',
    name: 'Miles Morales Classic',
    tagline: 'Qualquer um pode usar a máscara. Você pode usar a máscara.',
    year: '2011',
    period: 'Ultimate Fallout #4 / Into the Spider-Verse',
    version: 'Earth-1610 / Earth-42',
    universe: 'Earth-1610',
    origin: 'Criado por Miles Morales pintando com tinta spray preta e vermelha sobre uma réplica do traje concedida pela SHIELD.',
    description: 'Design moderno de rua com fundo preto fosco, teias vermelhas grafitadas e um estilo inconfundível.',
    characteristics: [
      'Base preta com aranha e detalhes vermelhos aplicados em tinta spray estilo grafite',
      'Corte ajustado com lentes expressivas brancas com contorno vermelho'
    ],
    abilities: [
      'Bio-Eletricidade (Venom Blast / Venom Strike)',
      'Camuflagem Invisível (Invisibilidade completa)'
    ],
    technology: [
      'Malha com condução de eletricidade bio-sintética'
    ],
    trivia: [
      'Miles personalizou seu traje usando tinta spray em uma cena clássica do filme vencedor do Oscar.'
    ],
    categories: ['ALL', 'MILES', 'MULTIVERSE', 'ANIMATION', 'LIVE-ACTION'],
    primaryColor: '#101014',
    accentColor: '#FF003C',
    glowColor: 'rgba(255, 0, 60, 0.8)',
    badgeText: 'BROOKLYN 2011',
    stats: {
      defense: 80,
      speed: 94,
      tech: 85,
      agility: 99,
      stealth: 100
    },
    hotspots: [],
    suitType: 'miles'
  },
  {
    id: 'noir-suit',
    number: '14',
    name: 'Spider-Man Noir',
    tagline: 'Sombras, Detetives e a Nova York de 1933.',
    year: '2009',
    period: 'Spider-Man Noir #1',
    version: 'Earth-90214 1930s',
    universe: 'Earth-90214',
    origin: 'Montado por Peter Parker na era da Grande Depressão a partir do uniforme de aviador da Primeira Guerra do seu tio Ben.',
    description: 'Um visual sombrio e pé-no-chão com sobretudo de couro preto, óculos de aviador com lentes reguláveis, chapéu fedora e revólver.',
    characteristics: [
      'Sobretudo de couro escuro reforçado com costuras duplas',
      'Óculos de proteção de aviador militar com lentes redondas'
    ],
    abilities: [
      'Furtividade absoluta nas sombras noturnas',
      'Combate corpo a corpo agressivo e investigativo'
    ],
    technology: [
      'Engrenagens analógicas e lentes de precisão manual'
    ],
    trivia: [
      'Dublado pelo ator Nicolas Cage no filme Into the Spider-Verse.'
    ],
    categories: ['ALL', 'CLASSICS', 'MULTIVERSE', 'ANIMATION'],
    primaryColor: '#1A1A1E',
    accentColor: '#888899',
    glowColor: 'rgba(150, 150, 160, 0.5)',
    badgeText: 'NOIR 1933',
    stats: {
      defense: 78,
      speed: 75,
      tech: 35,
      agility: 88,
      stealth: 99
    },
    hotspots: [],
    suitType: 'noir'
  },
  {
    id: 'spider-punk',
    number: '15',
    name: 'Spider-Punk',
    tagline: 'Anarquia, Guitarras e Revolução Contra o Sistema.',
    year: '2015',
    period: 'Amazing Spider-Man Vol. 3 #10 / Across the Spider-Verse',
    version: 'Earth-138 Hobie Brown',
    universe: 'Earth-138',
    origin: 'Criado pelo jovem anarquista Hobie Brown para liderar a revolução contra o regime autoritário do Presidente Osborn.',
    description: 'Uma mistura explosiva de punk rock e super-herói. Apresenta colete jeans rasgado coberto de broches e patches, spikes pontiagudos na máscara e guitarra.',
    characteristics: [
      'Máscara vermelha e preta com coroa de spikes metálicos',
      'Colete de sarja/denim rasgado com broches de bandas punk'
    ],
    abilities: [
      'Ataques sônicos de alta frequência usando amplificadores e sua guitarra'
    ],
    technology: [
      'Guitarra modificada com emissor de ondas sônicas de 15.000 Watts'
    ],
    trivia: [
      'Hobie derrotou o Presidente Osborn e seu exército simbionte usando 15.000 watts de puro som punk.'
    ],
    categories: ['ALL', 'MULTIVERSE', 'ANIMATION'],
    primaryColor: '#CC0000',
    accentColor: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.8)',
    badgeText: 'PUNK ROCK',
    stats: {
      defense: 75,
      speed: 92,
      tech: 70,
      agility: 97,
      stealth: 60
    },
    hotspots: [],
    suitType: 'punk'
  }
];

export const TIMELINE_DATA: TimelineItem[] = [
  {
    id: 't1',
    year: '1962',
    title: 'A Era Clássica de Steve Ditko',
    era: 'ORIGIN ERA',
    description: 'Amazing Fantasy #15 apresenta Peter Parker e o nascimento do herói da vizinhança com cores clássicas e disparadores mecânicos.',
    suitId: 'classic-suit',
    highlightSuitName: 'Classic Suit',
    keyEvents: [
      'Primeira aparição em Amazing Fantasy #15',
      'Criação dos disparadores de teia mecânicos',
      'Estreia das lentes oculares de ajuste expressivo'
    ],
    color: '#E50914'
  },
  {
    id: 't2',
    year: '1984',
    title: 'A Saga do Traje Negro Alienígena',
    era: 'SYMBIOTE ERA',
    description: 'Nas Guerras Secretas, Peter encontra um organismo vivo no espaço que transforma seu visual e suas habilidades para sempre.',
    suitId: 'symbiote-msm2',
    highlightSuitName: 'Symbiote Suit',
    keyEvents: [
      'Introdução no evento Secret Wars #8',
      'Teia orgânica ilimitada e troca de roupa instantânea',
      'Origem posterior da entidade Venom'
    ],
    color: '#FFFFFF'
  },
  {
    id: 't3',
    year: '1992',
    title: 'O Futuro Cibernético de 2099',
    era: 'FUTURE ERA',
    description: 'Miguel O\'Hara assume o manto no ano de 2099 em Nueva York com moléculas instáveis e garras de tálio.',
    suitId: 'spider-2099',
    highlightSuitName: 'Spider-Man 2099',
    keyEvents: [
      'Criação por Peter David e Rick Leonardi',
      'Capa de partículas de luz (Light-Byte)',
      'Tecnologia de viagem no tempo e multiverso'
    ],
    color: '#FF003C'
  },
  {
    id: 't4',
    year: '2006',
    title: 'A Armadura Iron Spider de Stark',
    era: 'CIVIL WAR ERA',
    description: 'Tony Stark projeta uma armadura nanotecnológica com braços mecânicos dorsais para Peter durante a Guerra Civil.',
    suitId: 'iron-spider',
    highlightSuitName: 'Iron Spider',
    keyEvents: [
      'Estreia na saga quadrinhos Civil War',
      'Adição dos braços mecânicos (Walandos)',
      'Interface tática com IA integrada'
    ],
    color: '#FFD700'
  },
  {
    id: 't5',
    year: '2011',
    title: 'A Revolução de Miles Morales & Big Time',
    era: 'MODERN HEROES ERA',
    description: 'Miles Morales assume o legado com o traje preto e vermelho no universo Ultimate, enquanto Peter desenvolve tecnologia de camuflagem.',
    suitId: 'miles-morales-suit',
    highlightSuitName: 'Miles Morales Classic',
    keyEvents: [
      'Estreia de Miles Morales em Ultimate Fallout #4',
      'Habilidades bio-elétricas (Venom Blast) e camuflagem',
      'Traje Big Time com luzes neon camufladas'
    ],
    color: '#00F0FF'
  },
  {
    id: 't6',
    year: '2018 - 2023+',
    title: 'Games Next-Gen & A Era do Aranhaverso',
    era: 'MULTIVERSE & GAMING ERA',
    description: 'O lançamento dos jogos da Insomniac e a trilogia premiada Aranhaverso levam a evolução dos trajes ao nível máximo da cultura pop.',
    suitId: 'advanced-suit-2',
    highlightSuitName: 'Advanced Suit 2.0 & Spider-Verse',
    keyEvents: [
      'Aranha branca reforçada em fibra de carbono',
      'Asas de teia (Web Wings) para voo livre',
      'Explosão cultural do Aranhaverso nos cinemas'
    ],
    color: '#E62429'
  }
];

export const MULTIVERSE_PORTALS: MultiversePortal[] = [
  {
    id: 'earth-616',
    heroName: 'Peter Parker',
    alterEgo: 'Spider-Man Primordial',
    universe: 'Earth-616',
    earthCode: '616',
    tagline: 'Onde a responsabilidade começou.',
    quote: 'Com grandes poderes vêm grandes responsabilidades.',
    description: 'O Homem-Aranha original do universo principal da Marvel Comics. Cientista brilhante, fotógrafo do Clarim Diário e o pilar de esperança de Nova York.',
    suitId: 'classic-suit',
    primaryColor: '#E50914',
    accentColor: '#0055FF',
    portalParticleColor: '#FF2A3B',
    traits: ['Genialidade Científica', 'Sentido Aranha Perfeito', 'Humor Lendário'],
    signatureWeapon: 'Disparadores de Teia Mecânicos Sintéticos'
  },
  {
    id: 'earth-1610',
    heroName: 'Miles Morales',
    alterEgo: 'Ultimate Spider-Man',
    universe: 'Earth-1610',
    earthCode: '1610 / 42',
    tagline: 'Qualquer um pode usar a máscara.',
    quote: 'É um salto de fé. Isso é tudo que é, Peter. Um salto de fé.',
    description: 'O jovem prodígio de Brooklyn com capacidade bio-elétrica devastadora e camuflagem de invisibilidade. Trouxe uma nova era e ritmo para o manto do herói.',
    suitId: 'miles-morales-suit',
    primaryColor: '#101014',
    accentColor: '#FF003C',
    portalParticleColor: '#FF003C',
    traits: ['Bio-Eletricidade Venom Blast', 'Invisibilidade Total', 'Estilo Street Art'],
    signatureWeapon: 'Bio-Eletricidade e Tênis Air Jordan'
  },
  {
    id: 'earth-928',
    heroName: 'Miguel O\'Hara',
    alterEgo: 'Spider-Man 2099',
    universe: 'Earth-928',
    earthCode: '928',
    tagline: 'Líder da Sociedade Aranha Multiversal.',
    quote: 'O cânone deve ser protegido. Custe o que custar.',
    description: 'Geneticista do futuro cibernético de Nueva York. Possui tecido molecular instável, garras cortantes e a missão de impedir o colapso do multiverso.',
    suitId: 'spider-2099',
    primaryColor: '#0A1B3A',
    accentColor: '#FF003C',
    portalParticleColor: '#00F0FF',
    traits: ['Garras de Tálio', 'Glider de Luz Plana', 'Visão Acelerada'],
    signatureWeapon: 'Dispositivo Temporal Gizmo e Capa Light-Byte'
  },
  {
    id: 'earth-90214',
    heroName: 'Peter Parker Noir',
    alterEgo: 'Spider-Man Noir',
    universe: 'Earth-90214',
    earthCode: '90214',
    tagline: 'Justiça na Sombra da Depressão.',
    quote: 'Onde quer que eu vá, o vento me segue. E tem cheiro de chuva.',
    description: 'Detetive durão operando no ano de 1933. Luta contra nazistas e mafiosos nos becos escuros usando sobretudo de couro, óculos de aviador e silêncio.',
    suitId: 'noir-suit',
    primaryColor: '#1A1A1E',
    accentColor: '#888899',
    portalParticleColor: '#A0A0A0',
    traits: ['Furtividade Absoluta', 'Táticas Investigativas', 'Combate sem Hesitação'],
    signatureWeapon: 'Sobretudo Militar e Lentes de Aviador'
  },
  {
    id: 'earth-138',
    heroName: 'Hobie Brown',
    alterEgo: 'Spider-Punk',
    universe: 'Earth-138',
    earthCode: '138',
    tagline: 'Anarquia e Liberdade de Expressão.',
    quote: 'Eu não acredito em rótulos. Nem em consistência visual.',
    description: 'Líder da revolução contra os fascistas. Usa uma guitarra elétrica Gibson de 15.000 Watts para pulverizar inimigos com ondas sônicas.',
    suitId: 'spider-punk',
    primaryColor: '#CC0000',
    accentColor: '#00E5FF',
    portalParticleColor: '#FF0055',
    traits: ['Ataques Sônicos', 'Colete com Spikes', 'Animação Desincronizada'],
    signatureWeapon: 'Guitarra Elétrica Sônica Gibson'
  }
];
