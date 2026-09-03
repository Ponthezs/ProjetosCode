import type { MovieItem, GameItem, MovieTimelineEra } from '../types/media';

export const MOVIES_DATA: MovieItem[] = [
  // Tobey Maguire Era
  {
    id: 'movie-2002',
    title: 'Homem-Aranha (Spider-Man)',
    year: '2002',
    era: 'tobey',
    eraName: 'Era Tobey Maguire (Trilogia Original Sam Raimi)',
    director: 'Sam Raimi',
    actors: ['Tobey Maguire', 'Kirsten Dunst', 'Willem Dafoe', 'James Franco'],
    villains: ['Duende Verde (Norman Osborn)'],
    summary: 'Peter Parker é um estudante tímido que é picado por uma aranha geneticamente modificada e ganha poderes sobre-humanos. Após a trágica morte do tio Ben, ele descobre que com grandes poderes vêm grandes responsabilidades.',
    highlights: [
      'Força e agilidade sobre-humanas com sentido-aranha',
      'Teias orgânicas disparadas diretamente dos pulsos',
      'Batalha final inesquecível contra o Duende Verde',
      'Revolucionou os filmes de super-heróis no cinema moderno'
    ],
    youtubeTrailerId: 't061KUS56lc',
    youtubeUrl: 'https://www.youtube.com/watch?v=t061KUS56lc',
    posterBadge: 'TRILOGIA ORIGINAL 2002'
  },
  {
    id: 'movie-2004',
    title: 'Homem-Aranha 2 (Spider-Man 2)',
    year: '2004',
    era: 'tobey',
    eraName: 'Era Tobey Maguire (Trilogia Original Sam Raimi)',
    director: 'Sam Raimi',
    actors: ['Tobey Maguire', 'Kirsten Dunst', 'Alfred Molina', 'James Franco'],
    villains: ['Doutor Octopus (Otto Octavius)'],
    summary: 'Peter enfrenta dificuldades para equilibrar sua vida pessoal com a responsabilidade de ser o Homem-Aranha. Surge o Doutor Octopus, cientista controlado por braços mecânicos de inteligência artificial.',
    highlights: [
      'Cena clássica do resgate do trem em Nova York',
      'Conflito emocional profundo de Peter sobre desistir do manto',
      'Considerado um dos maiores filmes de super-heróis de todos os tempos'
    ],
    youtubeTrailerId: '1s9Yln0YhBc',
    youtubeUrl: 'https://www.youtube.com/watch?v=1s9Yln0YhBc',
    posterBadge: 'OSCAR VENCEDOR 2004'
  },
  {
    id: 'movie-2007',
    title: 'Homem-Aranha 3 (Spider-Man 3)',
    year: '2007',
    era: 'tobey',
    eraName: 'Era Tobey Maguire (Trilogia Original Sam Raimi)',
    director: 'Sam Raimi',
    actors: ['Tobey Maguire', 'Kirsten Dunst', 'Topher Grace', 'Thomas Haden Church', 'James Franco'],
    villains: ['Homem-Areia', 'Venom (Eddie Brock)', 'Novo Duende (Harry Osborn)'],
    summary: 'No auge como herói, Peter entra em contato com o simbionte alienígena negro que altera seu comportamento para algo agressivo, enquanto lida com Homem-Areia e Venom.',
    highlights: [
      'Introdução do traje simbionte preto de teias prateadas',
      'Batalha emocional entre Peter e seu amigo Harry Osborn',
      'Conclusão da trilogia épica de Sam Raimi'
    ],
    youtubeTrailerId: 'e5wUilOeOmg',
    youtubeUrl: 'https://www.youtube.com/watch?v=e5wUilOeOmg',
    posterBadge: 'ENCERRAMENTO DA TRILOGIA 2007'
  },

  // Andrew Garfield Era
  {
    id: 'movie-2012',
    title: 'O Espetacular Homem-Aranha',
    year: '2012',
    era: 'andrew',
    eraName: 'Era Andrew Garfield (The Amazing Spider-Man)',
    director: 'Marc Webb',
    actors: ['Andrew Garfield', 'Emma Stone', 'Rhys Ifans', 'Denis Leary'],
    villains: ['Lagarto (Dr. Curt Connors)'],
    summary: 'Recomeço da franquia onde Peter Parker investiga o desaparecimento de seus pais, envolvendo-se com a Oscorp e iniciando seu relacionamento marcante com Gwen Stacy.',
    highlights: [
      'Peter Parker mais sarcástico, ágil e cientista',
      'Uso de disparadores mecânicos de teia de alta tecnologia',
      'Química aclamada entre Andrew Garfield e Emma Stone'
    ],
    youtubeTrailerId: '_X3924gT-es',
    youtubeUrl: 'https://www.youtube.com/watch?v=_X3924gT-es',
    posterBadge: 'AMAZING REBOOT 2012'
  },
  {
    id: 'movie-2014',
    title: 'O Espetacular Homem-Aranha 2: A Ameaça de Electro',
    year: '2014',
    era: 'andrew',
    eraName: 'Era Andrew Garfield (The Amazing Spider-Man)',
    director: 'Marc Webb',
    actors: ['Andrew Garfield', 'Emma Stone', 'Jamie Foxx', 'Dane DeHaan', 'Paul Giamatti'],
    villains: ['Electro (Max Dillon)', 'Duende Verde (Harry Osborn)', 'Rhino'],
    summary: 'Peter continua protegendo Nova York enquanto lida com Electro e a traição de Harry Osborn. O filme culmina em uma trágica perda que define o destino de Peter.',
    highlights: [
      'Movimentação e física de teia em 3D mais realistas do cinema',
      'A trágica cena da torre do relógio com Gwen Stacy',
      'Impacto direto na aparição de Andrew em Sem Volta Para Casa'
    ],
    youtubeTrailerId: 'DlM2CWNTQc0',
    youtubeUrl: 'https://www.youtube.com/watch?v=DlM2CWNTQc0',
    posterBadge: 'IMPACTO EMOTIVO 2014'
  },

  // Tom Holland MCU Era
  {
    id: 'movie-2017',
    title: 'Homem-Aranha: De Volta ao Lar (Homecoming)',
    year: '2017',
    era: 'tom',
    eraName: 'Era Tom Holland (Universo Cinematográfico Marvel - MCU)',
    director: 'Jon Watts',
    actors: ['Tom Holland', 'Michael Keaton', 'Robert Downey Jr.', 'Zendaya', 'Jacob Batalon'],
    villains: ['Abutre (Adrian Toomes)'],
    summary: 'Integrado ao MCU após ser mentorado por Tony Stark, Peter Parker tenta conciliar a vida de estudante do ensino médio enquanto enfrenta a ameaça do Abutre.',
    highlights: [
      'Primeiro filme solo de Peter Parker dentro dos Vingadores/MCU',
      'Traje Stark equipado com IA "Karen" e drones de teia',
      'Reinventou a dinâmica de vilão com Adrian Toomes'
    ],
    youtubeTrailerId: 'rk-dF1lIbIg',
    youtubeUrl: 'https://www.youtube.com/watch?v=rk-dF1lIbIg',
    posterBadge: 'ENTRADA NO MCU 2017'
  },
  {
    id: 'movie-2019',
    title: 'Homem-Aranha: Longe de Casa (Far From Home)',
    year: '2019',
    era: 'tom',
    eraName: 'Era Tom Holland (Universo Cinematográfico Marvel - MCU)',
    director: 'Jon Watts',
    actors: ['Tom Holland', 'Jake Gyllenhaal', 'Zendaya', 'Samuel L. Jackson'],
    villains: ['Mysterio (Quentin Beck)'],
    summary: 'Após o sacrifício de Tony Stark em Ultimato, Peter viaja pela Europa com colegas de escola, mas é enganado por Mysterio que usa ilusões holográficas.',
    highlights: [
      'Criação do traje tático vermelho e preto (Upgraded Suit)',
      'Sequência de ilusões psicodélicas de Mysterio',
      'Revelação pública da identidade de Peter na cena pós-créditos'
    ],
    youtubeTrailerId: 'Nt9L1jCKDH8',
    youtubeUrl: 'https://www.youtube.com/watch?v=Nt9L1jCKDH8',
    posterBadge: 'PÓS-ULTIMATO 2019'
  },
  {
    id: 'movie-2021',
    title: 'Homem-Aranha: Sem Volta Para Casa (No Way Home)',
    year: '2021',
    era: 'tom',
    eraName: 'Era Tom Holland (Universo Cinematográfico Marvel - MCU)',
    director: 'Jon Watts',
    actors: ['Tom Holland', 'Tobey Maguire', 'Andrew Garfield', 'Zendaya', 'Benedict Cumberbatch', 'Willem Dafoe', 'Alfred Molina'],
    villains: ['Duende Verde', 'Doutor Octopus', 'Electro', 'Homem-Areia', 'Lagarto'],
    summary: 'Para fazer o mundo esquecer sua identidade, Peter pede ajuda ao Doutor Estranho. O feitiço falha e rasga o Multiverso, reunindo as três gerações do Homem-Aranha!',
    highlights: [
      'Encontro histórico entre Tom Holland + Tobey Maguire + Andrew Garfield',
      'Retorno dos vilões lendários com suas vozes e atores originais',
      'Maior fenômeno de bilheteria e celebração do multiverso dos cinemas'
    ],
    youtubeTrailerId: 'JfVOs4VSpmA',
    youtubeUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    posterBadge: 'UNIFICAÇÃO MULTIVERSAL 2021'
  },
  {
    id: 'movie-2026',
    title: 'Homem-Aranha: Um Novo Dia (Brand New Day)',
    year: '2026',
    era: 'tom',
    eraName: 'Era Tom Holland (Universo Cinematográfico Marvel - MCU)',
    director: 'Destin Daniel Cretton',
    actors: ['Tom Holland', 'Zendaya', 'Sadie Sink'],
    villains: ['Nova Ameaça Sombria de Nova York'],
    summary: 'Estreou em julho de 2026. Quatro anos após Sem Volta Para Casa, Peter está totalmente sozinho após o feitiço do Doutor Estranho e atua em tempo integral como o Homem-Aranha de Nova York.',
    highlights: [
      'Novo capítulo na vida de Peter Parker como protetor urbano independente',
      'Traje clássico feito à mão sem auxílio da tecnologia Stark',
      'Evolução física e amadurecimento como o herói definitivo'
    ],
    youtubeTrailerId: 'r_M3nUj-4n0',
    youtubeUrl: 'https://www.youtube.com/watch?v=r_M3nUj-4n0',
    posterBadge: 'NOVO CAPÍTULO 2026'
  },

  // Spider-Verse Animated Era
  {
    id: 'movie-2018-anim',
    title: 'Homem-Aranha no Aranhaverso (Into the Spider-Verse)',
    year: '2018',
    era: 'spiderverse',
    eraName: 'Era Aranhaverso (Miles Morales & Multiverso Animado)',
    director: 'Bob Persichetti, Peter Ramsey, Rodney Rothman',
    actors: ['Shameik Moore', 'Jake Johnson', 'Hailee Steinfeld', 'Nicolas Cage', 'Mahershala Ali'],
    villains: ['Rei do Crime (Wilson Fisk)', 'Prowler (Aaron Davis)', 'Doutora Octopus'],
    summary: 'O jovem Miles Morales é picado por uma aranha e precisa assumir o manto após a morte do Peter Parker de seu universo, unindo-se a 5 versões alternativas de outras dimensões.',
    highlights: [
      'Estilo visual revolucionário de animação no formato HQs 2D/3D',
      'Vencedor do Oscar de Melhor Filme de Animação',
      'Trilha sonora icônica com a música Sunflower'
    ],
    youtubeTrailerId: 'g4Hbz2jLXvQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=g4Hbz2jLXvQ',
    posterBadge: 'OSCAR ANIMATED 2018'
  },
  {
    id: 'movie-2023-anim',
    title: 'Homem-Aranha: Através do Aranhaverso (Across the Spider-Verse)',
    year: '2023',
    era: 'spiderverse',
    eraName: 'Era Aranhaverso (Miles Morales & Multiverso Animado)',
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    actors: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya', 'Jason Schwartzman'],
    villains: ['Mancha (Spot)', 'Miguel O\'Hara (Spider-Man 2099)'],
    summary: 'Miles descobre a Sociedade Aranha liderada por Miguel O\'Hara com milhares de variantes aranha. Ele decide desafiar o próprio cânone para salvar seu pai.',
    highlights: [
      'Estreia épica de Hobie Brown (Spider-Punk) e Miguel O\'Hara (2099)',
      'Diversidade de estilos de arte para cada dimensão explorada',
      'Gancho emocionante preparando a sequência Além do Aranhaverso'
    ],
    youtubeTrailerId: 'cqGjhVJWtEg',
    youtubeUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    posterBadge: 'OBRA-PRIMA MULTIVERSAL 2023'
  },
  {
    id: 'movie-2027-anim',
    title: 'Homem-Aranha: Além do Aranhaverso (Beyond the Spider-Verse)',
    year: '2027',
    era: 'spiderverse',
    eraName: 'Era Aranhaverso (Miles Morales & Multiverso Animado)',
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    actors: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    villains: ['Mancha (Spot)', 'Miles Morales Earth-42 (Prowler)'],
    summary: 'A aguardada conclusão da trilogia animada de Miles Morales, onde ele enfrentará sua versão alternativa da Terra-42 e tentará salvar o multiverso.',
    highlights: [
      'Conclusão da história de Miles Morales e Gwen Stacy',
      'Batalha multiversal em escala definitiva',
      'Lançamento previsto nos cinemas para 2027'
    ],
    youtubeTrailerId: 'cqGjhVJWtEg',
    youtubeUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    posterBadge: 'AGUARDADO 2027'
  },

  // 1977 Live-Action Classic
  {
    id: 'movie-1977',
    title: 'Spider-Man (Série & Filmes Live-Action 1977)',
    year: '1977',
    era: 'classic77',
    eraName: 'Era Clássica Live-Action 1977 (Nicholas Hammond)',
    director: 'E.W. Swackhamer',
    actors: ['Nicholas Hammond', 'David White', 'Michael Pataki'],
    villains: ['Extorquistas Hipnóticos'],
    summary: 'A primeira versão live-action do Homem-Aranha nos cinemas e TV. Nicholas Hammond interpretou Peter Parker em episódios especiais de televisão editados como filmes.',
    highlights: [
      'Primeiro traje live-action adaptado para telas de TV e cinema',
      'Efeitos especiais práticos com cabos para escalada de prédios',
      'Trilogia de lançamentos: 1977, 1978 e 1981'
    ],
    youtubeTrailerId: 'd6yZ288rX00',
    youtubeUrl: 'https://www.youtube.com/watch?v=d6yZ288rX00',
    posterBadge: 'PRIMEIRO LIVE-ACTION 1977'
  }
];

export const GAMES_DATA: GameItem[] = [
  {
    id: 'game-1982',
    title: 'Spider-Man (Atari 2600)',
    year: '1982',
    platform: 'Atari 2600',
    era: '80s',
    eraName: '1982–1999: Os Primeiros Jogos',
    developer: 'Parker Brothers',
    summary: 'O primeiro jogo eletrônico da história do Homem-Aranha. O objetivo era escalar um arranha-céu usando teias enquanto desarmava bombas colocadas pelo Duende Verde.',
    keyInnovations: ['Primeiro jogo eletrônico de super-herói Marvel', 'Mecânica inicial de disparo vertical de teias'],
    isEssential: true
  },
  {
    id: 'game-1991',
    title: 'Spider-Man vs. The Kingpin & Arcade',
    year: '1991',
    platform: 'SEGA Genesis / Arcade',
    era: '90s',
    eraName: '1982–1999: Era 16-Bits & Arcade',
    developer: 'SEGA / Sega Technical Institute',
    summary: 'Marcou a infância dos anos 90 trazendo combates side-scrolling contra o Rei do Crime e tirando fotos para o Clarim Diário para comprar fluido de teia.',
    keyInnovations: ['Sistema de gerenciamento de fluido de teia', 'Fotografia para obter recursos no jogo'],
    isEssential: false
  },
  {
    id: 'game-1994',
    title: 'Spider-Man: Maximum Carnage',
    year: '1994',
    platform: 'SNES / SEGA Genesis',
    era: '90s',
    eraName: '1982–1999: Era 16-Bits & Arcade',
    developer: 'Software Creations / LJN',
    summary: 'Baseado na aclamada saga das HQs. Jogo beat \'em up em cartucho vermelho com trilha sonora gravada pela banda de rock Green Jellÿ.',
    keyInnovations: ['Possibilidade de jogar com Homem-Aranha e Venom', 'Estética de HQs com cutscenes em quadrinhos'],
    isEssential: true
  },
  {
    id: 'game-2000',
    title: 'Spider-Man (Neversoft PS1 / N64)',
    year: '2000',
    platform: 'PlayStation 1 / Nintendo 64 / PC',
    era: 'neversoft',
    eraName: '2000–2001: A Revolução 3D da Neversoft',
    developer: 'Neversoft / Activision',
    summary: 'Considerado um dos maiores clássicos da história. Introduziu navegação 3D em Nova York, dublagem completa com vozes da série animada dos anos 90 e narrado por Stan Lee.',
    keyInnovations: [
      'Narrações originais gravadas por Stan Lee',
      'Sistema de teia 3D, combate aéreo e dezenas de trajes desbloqueáveis',
      'Enfrentou Veneno, Carnificina, Doutor Octopus, Rino e Misterio'
    ],
    isEssential: true,
    youtubeTrailerId: 'q-9n8O0iZz0',
    youtubeUrl: 'https://www.youtube.com/watch?v=q-9n8O0iZz0'
  },
  {
    id: 'game-2004',
    title: 'Spider-Man 2 (Movie Game)',
    year: '2004',
    platform: 'PlayStation 2 / GameCube / Xbox',
    era: 'movie_era',
    eraName: '2002–2007: Era de Ouro dos Jogos de Filme',
    developer: 'Treyarch / Activision',
    summary: 'Um marco absoluto na história dos videogames. Foi o primeiro jogo a criar uma física realista de teia onde cada teia precisava se prender fisicamente aos prédios de Manhattan.',
    keyInnovations: [
      'Física física realista de pêndulo de teia presa aos prédios',
      'Mundo aberto expansivo de Nova York para explorar livremente',
      'Vozes originais de Tobey Maguire, Kirsten Dunst e Alfred Molina'
    ],
    isEssential: true,
    youtubeTrailerId: '2K79J5oJp7c',
    youtubeUrl: 'https://www.youtube.com/watch?v=2K79J5oJp7c'
  },
  {
    id: 'game-2005',
    title: 'Ultimate Spider-Man',
    year: '2005',
    platform: 'PS2 / Xbox / GameCube / PC',
    era: 'movie_era',
    eraName: '2005–2011: Universo Ultimate & Multiverso',
    developer: 'Treyarch',
    summary: 'Visual com gráficos cel-shading imitando quadrinhos vivos. Permitia alternar o gameplay entre controlar Peter Parker e controlar o vilão Venom destruindo a cidade.',
    keyInnovations: [
      'Gameplay alternado com Venom (absorção de inimigos)',
      'Estilo gráfico Cel-Shaded de HQ animada'
    ],
    isEssential: true
  },
  {
    id: 'game-2008',
    title: 'Spider-Man: Web of Shadows',
    year: '2008',
    platform: 'PS3 / Xbox 360 / PC',
    era: 'multiverse',
    eraName: '2005–2011: Universo Ultimate & Multiverso',
    developer: 'Shaba Games / Treyarch',
    summary: 'Uma invasão simbionte alienígena toma conta de Nova York. O jogo se tornou lendário pelo combate aéreo dinâmico e pela alternância instantânea entre o traje vermelho e o traje preto.',
    keyInnovations: [
      'Troca instantânea de traje (Vermelho x Preto Simbionte) durante combate',
      'Combate aéreo pelas paredes dos arranha-céus'
    ],
    isEssential: true,
    youtubeTrailerId: 'F-Fh5v40a6I',
    youtubeUrl: 'https://www.youtube.com/watch?v=F-Fh5v40a6I'
  },
  {
    id: 'game-2010',
    title: 'Spider-Man: Shattered Dimensions',
    year: '2010',
    platform: 'PS3 / Xbox 360 / PC / Wii',
    era: 'multiverse',
    eraName: '2005–2011: Universo Ultimate & Multiverso',
    developer: 'Beenox / Activision',
    summary: 'Serviu de inspiração direta para a criação do Aranhaverso! O jogador controla 4 aranhas de dimensões diferentes: Amazing, Ultimate, Noir e 2099.',
    keyInnovations: [
      '4 dimensões jogáveis com mecânicas de gameplay únicas',
      'Inspiração direta para a saga dos quadrinhos e filmes do Aranhaverso'
    ],
    isEssential: true,
    youtubeTrailerId: '5u3eJ4P-kYg',
    youtubeUrl: 'https://www.youtube.com/watch?v=5u3eJ4P-kYg'
  },
  {
    id: 'game-2018',
    title: 'Marvel\'s Spider-Man (PS4 / PS5 / PC)',
    year: '2018',
    platform: 'PS4 / PS5 / PC',
    era: 'insomniac',
    eraName: '2018–2023+: Universo Insomniac Games',
    developer: 'Insomniac Games / PlayStation Studios',
    summary: 'O ápice dos jogos do Homem-Aranha. Apresenta um Peter Parker adulto experiente em uma narrativa emocionante enfrentando o Doutor Octopus e os Sexteto Sinistro.',
    keyInnovations: [
      'Movimentação e física de travessia teia perfeitas a 60 FPS',
      'História cinematográfica aclamada mundialmente',
      'Dezenas de trajes fiéis das HQs e cinemas'
    ],
    isEssential: true,
    youtubeTrailerId: 'q4GdJVvdxrG',
    youtubeUrl: 'https://www.youtube.com/watch?v=q4GdJVvdxrG'
  },
  {
    id: 'game-2020',
    title: 'Marvel\'s Spider-Man: Miles Morales',
    year: '2020',
    platform: 'PS4 / PS5 / PC',
    era: 'insomniac',
    eraName: '2018–2023+: Universo Insomniac Games',
    developer: 'Insomniac Games',
    summary: 'Miles Morales assume o protagonismo em Nova York no inverno de Harlem. Utiliza bio-eletricidade Venom Blast e camuflagem invisível em batalhas espetaculares.',
    keyInnovations: [
      'Poderes bio-elétricos (Venom Strike & Venom Blast)',
      'Habilidade de camuflagem invisível em tempo real'
    ],
    isEssential: true,
    youtubeTrailerId: 'NTunTURbyUU',
    youtubeUrl: 'https://www.youtube.com/watch?v=NTunTURbyUU'
  },
  {
    id: 'game-2023',
    title: 'Marvel\'s Spider-Man 2 (PS5 / PC)',
    year: '2023',
    platform: 'PS5 / PC',
    era: 'insomniac',
    eraName: '2018–2023+: Universo Insomniac Games',
    developer: 'Insomniac Games',
    summary: 'O capítulo definitivo da Insomniac. Permite alternar instantaneamente entre Peter Parker e Miles Morales enquanto enfrentam Kraven o Caçador e o simbionte Venom.',
    keyInnovations: [
      'Troca instantânea entre Peter Parker e Miles Morales no mapa',
      'Asas de Teia (Web Wings) para voar em alta velocidade por Manhattan e Brooklyn',
      'Poderes de simbionte preto e traje Anti-Venom'
    ],
    isEssential: true,
    youtubeTrailerId: 'bgqGdIoa52s',
    youtubeUrl: 'https://www.youtube.com/watch?v=bgqGdIoa52s'
  }
];

export const MOVIE_TIMELINE_ERAS: MovieTimelineEra[] = [
  {
    eraId: 'tobey-era',
    eraName: 'Linha do Tempo de Tobey Maguire (Trilogia Sam Raimi)',
    badge: 'EARTH-96283',
    years: '2002 — 2007',
    movies: [
      { year: '2002', title: 'Homem-Aranha (Spider-Man)' },
      { year: '2004', title: 'Homem-Aranha 2' },
      { year: '2007', title: 'Homem-Aranha 3' }
    ],
    color: '#E50914'
  },
  {
    eraId: 'andrew-era',
    eraName: 'Linha do Tempo de Andrew Garfield (The Amazing Spider-Man)',
    badge: 'EARTH-120703',
    years: '2012 — 2014',
    movies: [
      { year: '2012', title: 'O Espetacular Homem-Aranha' },
      { year: '2014', title: 'O Espetacular Homem-Aranha 2: A Ameaça de Electro' }
    ],
    color: '#00F0FF'
  },
  {
    eraId: 'tom-era',
    eraName: 'Linha do Tempo de Tom Holland (Universo Cinematográfico Marvel - MCU)',
    badge: 'EARTH-616 / 199999',
    years: '2016 — 2026+',
    movies: [
      { year: '2016', title: 'Capitão América: Guerra Civil', note: 'Primeira aparição de Peter no MCU' },
      { year: '2017', title: 'Homem-Aranha: De Volta ao Lar' },
      { year: '2018', title: 'Vingadores: Guerra Infinita' },
      { year: '2019', title: 'Vingadores: Ultimato' },
      { year: '2019', title: 'Homem-Aranha: Longe de Casa' },
      { year: '2021', title: 'Homem-Aranha: Sem Volta Para Casa' },
      { year: '2026', title: 'Homem-Aranha: Um Novo Dia (Brand New Day)', note: 'Estreia em julho de 2026' }
    ],
    color: '#FFD700'
  },
  {
    eraId: 'spiderverse-era',
    eraName: 'Linha do Tempo do Aranhaverso (Miles Morales Animado)',
    badge: 'MULTIVERSE EARTH-1610',
    years: '2018 — 2027',
    movies: [
      { year: '2018', title: 'Homem-Aranha no Aranhaverso' },
      { year: '2023', title: 'Homem-Aranha: Através do Aranhaverso' },
      { year: '2027', title: 'Homem-Aranha: Além do Aranhaverso (Previsto)' }
    ],
    color: '#FF0055'
  }
];
