const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// Kullanıcı bilgileri (hardcoded)
const users = {
    'aleyna': 'onur',
    'onur': 'aleyna'
};

// Oyun durumu
let gameState = {
    players: {},
    onurOnline: false,
    aleynaOnline: false,
    gameStarted: false,
    currentLevel: 1,
    iceCreams: [],
    doorOpen: false
};

// Seviye verileri - v3 zigzag tasarım
const levelData = {
    1: {
        platforms: [
            { x: 0, y: 560, width: 1000, height: 40, type: 'grass' },
            { x: 100, y: 480, width: 200, height: 25, type: 'normal' },
            { x: 350, y: 430, width: 200, height: 25, type: 'normal' },
            { x: 600, y: 480, width: 200, height: 25, type: 'normal' },
            { x: 820, y: 420, width: 150, height: 25, type: 'normal' }
        ],
        iceCreams: [
            { x: 180, y: 430, type: 'strawberry' },
            { x: 430, y: 380, type: 'vanilla' },
            { x: 680, y: 430, type: 'mint' },
            { x: 870, y: 370, type: 'chocolate' }
        ],
        door: { x: 870, y: 350 },
        onurStart: { x: 50, y: 500 },
        aleynaStart: { x: 100, y: 500 }
    },
    2: {
        platforms: [
            { x: 0, y: 560, width: 1000, height: 40, type: 'grass' },
            { x: 50, y: 480, width: 180, height: 25, type: 'normal' },
            { x: 280, y: 420, width: 180, height: 25, type: 'normal' },
            { x: 500, y: 480, width: 180, height: 25, type: 'normal' },
            { x: 720, y: 420, width: 180, height: 25, type: 'normal' },
            { x: 100, y: 350, width: 180, height: 25, type: 'normal' },
            { x: 350, y: 290, width: 180, height: 25, type: 'normal' },
            { x: 580, y: 350, width: 180, height: 25, type: 'normal' },
            { x: 800, y: 280, width: 150, height: 25, type: 'normal' },
            { x: 200, y: 210, width: 200, height: 25, type: 'normal' },
            { x: 500, y: 150, width: 200, height: 25, type: 'normal' },
            { x: 750, y: 180, width: 150, height: 25, type: 'normal' }
        ],
        iceCreams: [
            { x: 120, y: 430, type: 'strawberry' },
            { x: 350, y: 370, type: 'chocolate' },
            { x: 570, y: 430, type: 'vanilla' },
            { x: 790, y: 370, type: 'mint' },
            { x: 170, y: 300, type: 'blueberry' },
            { x: 420, y: 240, type: 'rainbow' },
            { x: 650, y: 300, type: 'strawberry' },
            { x: 860, y: 230, type: 'chocolate' },
            { x: 280, y: 160, type: 'vanilla' },
            { x: 580, y: 100, type: 'rainbow' }
        ],
        door: { x: 560, y: 80 },
        onurStart: { x: 80, y: 500 },
        aleynaStart: { x: 130, y: 500 }
    },
    3: {
        platforms: [
            { x: 0, y: 560, width: 1000, height: 40, type: 'grass' },
            { x: 0, y: 480, width: 180, height: 25, type: 'normal' },
            { x: 220, y: 420, width: 180, height: 25, type: 'normal' },
            { x: 450, y: 480, width: 180, height: 25, type: 'normal' },
            { x: 680, y: 420, width: 180, height: 25, type: 'normal' },
            { x: 880, y: 480, width: 120, height: 25, type: 'normal' },
            { x: 100, y: 350, width: 180, height: 25, type: 'normal' },
            { x: 330, y: 300, width: 180, height: 25, type: 'normal' },
            { x: 560, y: 350, width: 180, height: 25, type: 'normal' },
            { x: 780, y: 300, width: 180, height: 25, type: 'normal' },
            { x: 50, y: 220, width: 180, height: 25, type: 'normal' },
            { x: 280, y: 170, width: 200, height: 25, type: 'normal' },
            { x: 530, y: 220, width: 180, height: 25, type: 'normal' },
            { x: 750, y: 160, width: 200, height: 25, type: 'normal' },
            { x: 400, y: 90, width: 200, height: 25, type: 'normal' }
        ],
        iceCreams: [
            { x: 70, y: 430, type: 'strawberry' },
            { x: 290, y: 370, type: 'chocolate' },
            { x: 520, y: 430, type: 'vanilla' },
            { x: 750, y: 370, type: 'mint' },
            { x: 920, y: 430, type: 'blueberry' },
            { x: 170, y: 300, type: 'rainbow' },
            { x: 400, y: 250, type: 'strawberry' },
            { x: 630, y: 300, type: 'chocolate' },
            { x: 850, y: 250, type: 'vanilla' },
            { x: 120, y: 170, type: 'mint' },
            { x: 360, y: 120, type: 'blueberry' },
            { x: 600, y: 170, type: 'rainbow' },
            { x: 830, y: 110, type: 'strawberry' },
            { x: 480, y: 40, type: 'rainbow' }
        ],
        door: { x: 470, y: 20 },
        onurStart: { x: 30, y: 500 },
        aleynaStart: { x: 920, y: 500 }
    },
    4: {
        platforms: [
            { x: 0, y: 560, width: 1000, height: 40, type: 'grass' },
            { x: 0, y: 480, width: 150, height: 25, type: 'normal' },
            { x: 100, y: 400, width: 150, height: 25, type: 'normal' },
            { x: 0, y: 320, width: 150, height: 25, type: 'normal' },
            { x: 100, y: 240, width: 150, height: 25, type: 'normal' },
            { x: 200, y: 160, width: 150, height: 25, type: 'normal' },
            { x: 850, y: 480, width: 150, height: 25, type: 'normal' },
            { x: 750, y: 400, width: 150, height: 25, type: 'normal' },
            { x: 850, y: 320, width: 150, height: 25, type: 'normal' },
            { x: 750, y: 240, width: 150, height: 25, type: 'normal' },
            { x: 650, y: 160, width: 150, height: 25, type: 'normal' },
            { x: 350, y: 450, width: 150, height: 25, type: 'normal' },
            { x: 500, y: 380, width: 150, height: 25, type: 'normal' },
            { x: 350, y: 300, width: 150, height: 25, type: 'normal' },
            { x: 500, y: 220, width: 150, height: 25, type: 'normal' },
            { x: 400, y: 100, width: 200, height: 25, type: 'normal' }
        ],
        iceCreams: [
            { x: 60, y: 430, type: 'strawberry' },
            { x: 160, y: 350, type: 'chocolate' },
            { x: 60, y: 270, type: 'vanilla' },
            { x: 160, y: 190, type: 'mint' },
            { x: 260, y: 110, type: 'blueberry' },
            { x: 910, y: 430, type: 'rainbow' },
            { x: 810, y: 350, type: 'strawberry' },
            { x: 910, y: 270, type: 'chocolate' },
            { x: 810, y: 190, type: 'vanilla' },
            { x: 710, y: 110, type: 'mint' },
            { x: 410, y: 400, type: 'blueberry' },
            { x: 560, y: 330, type: 'rainbow' },
            { x: 480, y: 50, type: 'rainbow' }
        ],
        door: { x: 470, y: 30 },
        onurStart: { x: 30, y: 500 },
        aleynaStart: { x: 920, y: 500 }
    },
    5: {
        platforms: [
            { x: 0, y: 560, width: 1000, height: 40, type: 'grass' },
            { x: 50, y: 500, width: 200, height: 25, type: 'normal' },
            { x: 300, y: 450, width: 200, height: 25, type: 'normal' },
            { x: 550, y: 500, width: 200, height: 25, type: 'normal' },
            { x: 800, y: 450, width: 150, height: 25, type: 'normal' },
            { x: 700, y: 380, width: 180, height: 25, type: 'normal' },
            { x: 450, y: 330, width: 200, height: 25, type: 'normal' },
            { x: 200, y: 380, width: 180, height: 25, type: 'normal' },
            { x: 50, y: 300, width: 150, height: 25, type: 'normal' },
            { x: 150, y: 230, width: 180, height: 25, type: 'normal' },
            { x: 380, y: 180, width: 200, height: 25, type: 'normal' },
            { x: 620, y: 250, width: 180, height: 25, type: 'normal' },
            { x: 830, y: 180, width: 150, height: 25, type: 'normal' },
            { x: 650, y: 110, width: 180, height: 25, type: 'normal' },
            { x: 400, y: 60, width: 200, height: 25, type: 'normal' }
        ],
        iceCreams: [
            { x: 130, y: 450, type: 'strawberry' },
            { x: 380, y: 400, type: 'chocolate' },
            { x: 630, y: 450, type: 'vanilla' },
            { x: 860, y: 400, type: 'mint' },
            { x: 770, y: 330, type: 'blueberry' },
            { x: 530, y: 280, type: 'rainbow' },
            { x: 270, y: 330, type: 'strawberry' },
            { x: 100, y: 250, type: 'chocolate' },
            { x: 220, y: 180, type: 'vanilla' },
            { x: 460, y: 130, type: 'mint' },
            { x: 690, y: 200, type: 'blueberry' },
            { x: 890, y: 130, type: 'rainbow' },
            { x: 720, y: 60, type: 'strawberry' },
            { x: 480, y: 10, type: 'rainbow' }
        ],
        door: { x: 470, y: 490 },
        onurStart: { x: 100, y: 500 },
        aleynaStart: { x: 850, y: 500 }
    }
};

// Seviye başlat
function initLevel(level) {
    const data = levelData[level];
    gameState.currentLevel = level;
    gameState.iceCreams = data.iceCreams.map((ic, index) => ({
        ...ic,
        id: index,
        collected: false,
        collectedBy: null
    }));
    gameState.doorOpen = false;

    // Oyuncu pozisyonlarını sıfırla
    if (gameState.players.onur) {
        gameState.players.onur.x = data.onurStart.x;
        gameState.players.onur.y = data.onurStart.y;
        gameState.players.onur.score = 0;
        gameState.players.onur.atDoor = false;
    }
    if (gameState.players.aleyna) {
        gameState.players.aleyna.x = data.aleynaStart.x;
        gameState.players.aleyna.y = data.aleynaStart.y;
        gameState.players.aleyna.score = 0;
        gameState.players.aleyna.atDoor = false;
    }
}

io.on('connection', (socket) => {
    console.log('Bir kullanıcı bağlandı:', socket.id);

    // Giriş denemesi
    socket.on('login', (data) => {
        const { username, password } = data;
        const lowerUsername = username.toLowerCase();

        // Kullanıcı doğrulama
        if (users[lowerUsername] && users[lowerUsername] === password.toLowerCase()) {
            // Zaten giriş yapmış mı kontrol et
            if ((lowerUsername === 'onur' && gameState.onurOnline) ||
                (lowerUsername === 'aleyna' && gameState.aleynaOnline)) {
                socket.emit('loginError', 'Bu kullanıcı zaten giriş yapmış!');
                return;
            }

            // Giriş başarılı
            socket.username = lowerUsername;

            if (lowerUsername === 'onur') {
                gameState.onurOnline = true;
                gameState.players.onur = {
                    id: socket.id,
                    x: 50,
                    y: 500,
                    velX: 0,
                    velY: 0,
                    score: 0,
                    atDoor: false
                };
            } else {
                gameState.aleynaOnline = true;
                gameState.players.aleyna = {
                    id: socket.id,
                    x: 100,
                    y: 500,
                    velX: 0,
                    velY: 0,
                    score: 0,
                    atDoor: false
                };
            }

            socket.emit('loginSuccess', { username: lowerUsername });

            // Diğer oyuncuya bildir
            socket.broadcast.emit('playerJoined', { username: lowerUsername });

            // İki oyuncu da giriş yaptıysa oyunu başlat
            if (gameState.onurOnline && gameState.aleynaOnline) {
                gameState.gameStarted = true;
                initLevel(1);
                io.emit('gameStart', {
                    level: 1,
                    levelData: levelData[1],
                    iceCreams: gameState.iceCreams,
                    players: gameState.players
                });
            } else {
                socket.emit('waitingForPlayer');
            }
        } else {
            socket.emit('loginError', 'Kullanıcı adı veya şifre hatalı!');
        }
    });

    // Oyuncu hareketi
    socket.on('playerMove', (data) => {
        if (!gameState.gameStarted) return;

        const player = socket.username === 'onur' ? gameState.players.onur : gameState.players.aleyna;
        if (player) {
            player.x = data.x;
            player.y = data.y;
            player.velX = data.velX;
            player.velY = data.velY;

            // Diğer oyuncuya gönder
            socket.broadcast.emit('playerMoved', {
                username: socket.username,
                x: data.x,
                y: data.y,
                velX: data.velX,
                velY: data.velY
            });
        }
    });

    // Dondurma toplama
    socket.on('collectIceCream', (data) => {
        if (!gameState.gameStarted) return;

        const iceCream = gameState.iceCreams.find(ic => ic.id === data.id && !ic.collected);
        if (iceCream) {
            iceCream.collected = true;
            iceCream.collectedBy = socket.username;

            const player = socket.username === 'onur' ? gameState.players.onur : gameState.players.aleyna;
            if (player) {
                player.score++;
            }

            // Tüm dondurmalar toplandı mı?
            const allCollected = gameState.iceCreams.every(ic => ic.collected);
            gameState.doorOpen = allCollected;

            io.emit('iceCreamCollected', {
                id: data.id,
                collectedBy: socket.username,
                doorOpen: gameState.doorOpen,
                scores: {
                    onur: gameState.players.onur?.score || 0,
                    aleyna: gameState.players.aleyna?.score || 0
                }
            });
        }
    });

    // Kapıya ulaşma
    socket.on('atDoor', (data) => {
        if (!gameState.gameStarted || !gameState.doorOpen) return;

        const player = socket.username === 'onur' ? gameState.players.onur : gameState.players.aleyna;
        if (player) {
            player.atDoor = data.atDoor;

            // İki oyuncu da kapıda mı?
            if (gameState.players.onur?.atDoor && gameState.players.aleyna?.atDoor) {
                if (gameState.currentLevel >= 5) {
                    // Oyun bitti
                    io.emit('gameComplete', {
                        scores: {
                            onur: gameState.players.onur.score,
                            aleyna: gameState.players.aleyna.score
                        }
                    });
                } else {
                    // Sonraki seviye
                    const nextLevel = gameState.currentLevel + 1;
                    initLevel(nextLevel);
                    io.emit('levelComplete', {
                        level: gameState.currentLevel,
                        levelData: levelData[gameState.currentLevel],
                        iceCreams: gameState.iceCreams,
                        players: gameState.players,
                        scores: {
                            onur: gameState.players.onur.score,
                            aleyna: gameState.players.aleyna.score
                        }
                    });
                }
            }
        }
    });

    // Tekrar oyna
    socket.on('playAgain', () => {
        if (gameState.onurOnline && gameState.aleynaOnline) {
            initLevel(1);
            io.emit('gameStart', {
                level: 1,
                levelData: levelData[1],
                iceCreams: gameState.iceCreams,
                players: gameState.players
            });
        }
    });

    // Bağlantı koptuğunda
    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı:', socket.id);

        if (socket.username === 'onur') {
            gameState.onurOnline = false;
            delete gameState.players.onur;
        } else if (socket.username === 'aleyna') {
            gameState.aleynaOnline = false;
            delete gameState.players.aleyna;
        }

        gameState.gameStarted = false;

        // Diğer oyuncuya bildir
        socket.broadcast.emit('playerLeft', { username: socket.username });
    });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`Server ${HOST}:${PORT} adresinde çalışıyor`);
    console.log('');
    console.log('Kullanıcılar:');
    console.log('  Aleyna - Şifre: onur');
    console.log('  Onur - Şifre: aleyna');
});
