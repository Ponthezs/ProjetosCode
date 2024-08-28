kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1]
});

const MOVE_SPEED = 120;
const ENEMY_SPEED = 60;

// Carregar sprites
loadRoot('https://i.imgur.com/');
loadSprite('wall-steel', 'EkleLlt.png');
loadSprite('brick-red', 'C46n8aY.png');
loadSprite('door', 'Ou9w4gH.png');
loadSprite('kaboom', 'etY46bP.png');
loadSprite('bg', 'qIXIczt.png');
loadSprite('wall-gold', 'VtTXsgH.png');
loadSprite('brick-wood', 'U751RRV.png');
loadSprite('bomberman', 'T0xbHb8.png', {
    sliceX: 7,
    sliceY: 4,
    anims: {
        idleLeft: { from: 21, to: 21 },
        idleRight: { from: 7, to: 7 },
        idleUp: { from: 0, to: 0 },
        idleDown: { from: 14, to: 14 },
        moveLeft: { from: 22, to: 27 },
        moveRight: { from: 8, to: 13 },
        moveUp: { from: 1, to: 6 },
        moveDown: { from: 15, to: 20 }
    }
});
loadSprite('baloon', 'z59lNU0.png', { sliceX: 3 });
loadSprite('ghost', '6YV0Zas.png', { sliceX: 3 });
loadSprite('slime', 'c1Vj0j1.png', { sliceX: 3 });
loadSprite('boomber', 'etY46bP.png', { sliceX: 3, anims: { move: { from: 0, to: 2 } } });
loadSprite('explosion', 'baBxoqs.png', { sliceX: 5, sliceY: 5 });

// Configuração dos mapas
const maps = [
    [
        'aaaaaaaaaaaaaaa',
        'azzz  &  tzzzza',
        'azzzazzzzaazzaa',
        'aazazazazazazaa',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'aaaaaaaaaaaaaaa'
    ],
    [
        'aaaaaaaaaaaaaaa',
        'a t  zzzzz  t a',
        'a z aaaa a z a a',
        'a z a  z a z a a',
        'a z a  d a z a a',
        'a z a a  a z a a',
        'a z a a a z a a a',
        'a z a  t a z a a a',
        'a z a a a z a a a',
        'a z a z a z a a a',
        'a z a z a z a a a',
        'a z a z a z a a a',
        'a z a z a z a a a',
        'aaaaaaaaaaaaaaa'
    ],
    [
        'aaaaaaaaaaaaaaa',
        'a  z      z  a',
        'a z aaaaa a z a',
        'a z a     a z a',
        'a z a a a a z a',
        'a z a a a a z a',
        'a z a a a a z a',
        'a z a a a a z a',
        'a z a a a a z a',
        'a z a a a a z a',
        'a z a a a a z a',
        'a z a a a a z a',
        'a z a a a a z a',
        'aaaaaaaaaaaaaaa'
    ],
    [
        'aaaaaaaaaaaaaaa',
        'azzz  &  }zzzza',
        'azzzazzzzaazzaa',
        'aazazazazazazaa',
        'a  *         a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'a             a',
        'aaaaaaaaaaaaaaa'
    ]
];

const levelCfg = {
    width: 26,
    height: 26,
    a: [sprite('wall-steel'), 'wall-steel', solid(), 'wall'],
    z: [sprite('brick-red'), 'wall-brick', solid(), 'wall'],
    d: [sprite('brick-red'), 'wall-brick-dool', solid(), 'wall'],
    b: [sprite('wall-gold'), 'wall-gold', solid(), 'wall'],
    w: [sprite('brick-wood'), 'wall-brick', solid(), 'wall'],
    p: [sprite('brick-wood'), 'wall-brick-dool', solid(), 'wall'],
    t: [sprite('door'), 'door', 'wall'],
    '}': [sprite('ghost'), 'ghost', 'dangerous', { dir: -1, time: 0 }],
    '&': [sprite('slime'), 'slime', 'dangerous', { dir: -1, time: 0 }],
    '*': [sprite('baloon'), 'baloon', 'dangerous', { dir: -1, time: 0 }]
};

// Função para criar uma explosão
function spawnKaboom(p, frame) {
    const obj = add([
        sprite('explosion', { animeSpeed: 0.1, frame }),
        pos(p),
        scale(1.5),
        'kaboom'
    ]);

    obj.pushOutAll();
    wait(0.5, () => {
        destroy(obj);
    });
}

// Função para criar uma bomba
function spawnBomber(p) {
    const obj = add([
        sprite('boomber', { anims: { move: { from: 0, to: 2 } } }),
        pos(p),
        scale(1.5),
        'bomber'
    ]);

    obj.pushOutAll();
    obj.play("move");

    wait(4, () => {
        destroy(obj);
        const directions = [
            { dir: vec2(1, 0), frame: 12 }, // Center
            { dir: vec2(0, -1), frame: 2 }, // Up
            { dir: vec2(0, 1), frame: 22 }, // Down
            { dir: vec2(-1, 0), frame: 10 }, // Left
            { dir: vec2(1, 0), frame: 14 }  // Right
        ];

        directions.forEach(({ dir, frame }) => {
            spawnKaboom(obj.pos.add(dir.scale(20)), frame);
        });
    });
}

// Função principal do jogo
scene('game', ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj');

    add([sprite('bg'), layer('bg')]);

    const gameLevel = addLevel(maps[level], levelCfg);

    const scoreLabel = add([
        text('Score: ' + score),
        pos(400, 30),
        layer('ui'),
        {
            value: score
        },
        scale(1)
    ]);

    add([text('Level: ' + (level + 1)), pos(400, 60), scale(1)]);

    const player = add([
        sprite('bomberman', { anims: { idleRight: { from: 7, to: 7 }, moveRight: { from: 8, to: 13 } } }),
        pos(20, 190),
        { dir: vec2(1, 0) }
    ]);

    // Controle do jogador
    player.action(() => {
        player.pushOutAll();
    });

    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0);
        player.dir = vec2(-1, 0);
    });

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0);
        player.dir = vec2(1, 0);
    });

    keyDown('up', () => {
        player.move(0, -MOVE_SPEED);
        player.dir = vec2(0, -1);
    });

    keyDown('down', () => {
        player.move(0, MOVE_SPEED);
        player.dir = vec2(0, 1);
    });

    keyPress('left', () => player.play('moveLeft'));
    keyPress('right', () => player.play('moveRight'));
    keyPress('up', () => player.play('moveUp'));
    keyPress('down', () => player.play('moveDown'));

    keyRelease('left', () => player.play('idleLeft'));
    keyRelease('right', () => player.play('idleRight'));
    keyRelease('up', () => player.play('idleUp'));
    keyRelease('down', () => player.play('idleDown'));

    keyPress('space', () => spawnBomber(player.pos.add(player.dir.scale(0))));

    // Ações dos inimigos
    function moveEnemy(s) {
        s.pushOutAll();
        s.move(s.dir.scale(ENEMY_SPEED));
        s.time -= dt();

        if (s.time <= 0) {
            s.dir = -s.dir;
            s.time = rand(5);
        }
    }

    action('baloon', moveEnemy);
    action('slime', moveEnemy);

    action('ghost', (s) => {
        s.pushOutAll();
        s.move(0, s.dir * ENEMY_SPEED);
        s.time -= dt();

        if (s.time <= 0) {
            s.dir = -s.dir;
            s.time = rand(5);
        }
    });

    // Colisões
    player.collides('door', (d) => {
        go("game", { level: (level + 1) % maps.length, score: scoreLabel.value });
    });

    collides('kaboom', 'dangerous', (k, s) => {
        camShake(4);
        wait(1, () => destroy(k));
        destroy(s);
        scoreLabel.value++;
        scoreLabel.text = 'Score: ' + scoreLabel.value;
    });

    collides('kaboom', 'wall-brick', (k, s) => {
        camShake(4);
        wait(1, () => destroy(k));
        destroy(s);
    });

    collides('baloon', 'wall', (s) => s.dir = -s.dir);
    collides('ghost', 'wall', (s) => s.dir = -s.dir);
    collides('slime', 'wall', (s) => s.dir = -s.dir);
});

// Inicialize o jogo
start('game', { level: 0, score: 0 });
