const canvas = document.getElementById('chess');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('statusText');
const startBtn = document.getElementById('startBtn');

let chessBoard = [];
let me = true; 
let over = false;
let myColor = 'black'; 
let userName = "玩家";

// --- 贏法算法初始化 ---
let wins = []; // 贏法三維陣列 [x][y][第幾種贏法]
let count = 0; // 總共有多少種贏法

for (let i = 0; i < 15; i++) {
    wins[i] = [];
    for (let j = 0; j < 15; j++) {
        wins[i][j] = [];
    }
}

// 橫線贏法
for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 11; j++) {
        for (let k = 0; k < 5; k++) {
            wins[i][j+k][count] = true;
        }
        count++;
    }
}
// 豎線贏法
for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 11; j++) {
        for (let k = 0; k < 5; k++) {
            wins[j+k][i][count] = true;
        }
        count++;
    }
}
// 斜線贏法
for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 11; j++) {
        for (let k = 0; k < 5; k++) {
            wins[i+k][j+k][count] = true;
        }
        count++;
    }
}
// 反斜線贏法
for (let i = 0; i < 11; i++) {
    for (let j = 14; j > 3; j--) {
        for (let k = 0; k < 5; k++) {
            wins[i+k][j-k][count] = true;
        }
        count++;
    }
}

let myWin = [];
let computerWin = [];

function initData() {
    for (let i = 0; i < 15; i++) {
        chessBoard[i] = [];
        for (let j = 0; j < 15; j++) {
            chessBoard[i][j] = 0;
        }
    }
    for (let i = 0; i < count; i++) {
        myWin[i] = 0;
        computerWin[i] = 0;
    }
}

// --- 繪圖邏輯 ---
function drawBoard() {
    ctx.strokeStyle = "#444";
    for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(15 + i * 30, 15);
        ctx.lineTo(15 + i * 30, 435);
        ctx.stroke();
        ctx.moveTo(15, 15 + i * 30);
        ctx.lineTo(435, 15 + i * 30);
        ctx.stroke();
    }
}

function oneStep(i, j, isBlack) {
    ctx.beginPath();
    ctx.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);
    let grad = ctx.createRadialGradient(15+i*30+2, 15+j*30-2, 13, 15+i*30+2, 15+j*30-2, 0);
    if (isBlack) {
        grad.addColorStop(0, "#0A0A0A");
        grad.addColorStop(1, "#636766");
    } else {
        grad.addColorStop(0, "#D1D1D1");
        grad.addColorStop(1, "#F9F9F9");
    }
    ctx.fillStyle = grad;
    ctx.fill();
}

// --- 遊戲控制 ---
startBtn.onclick = function() {
    userName = document.getElementById('playerName').value || "玩家";
    myColor = document.getElementById('playerColor').value;
    resetGame();
    if (myColor === 'white') {
        me = false;
        computerAI();
    } else {
        me = true;
    }
    statusText.innerText = `對決中：${userName} (持${myColor === 'black' ? '黑' : '白'})`;
}

canvas.onclick = function(e) {
    if (over || !me) return;
    let i = Math.floor(e.offsetX / 30);
    let j = Math.floor(e.offsetY / 30);

    if (chessBoard[i][j] === 0) {
        oneStep(i, j, myColor === 'black');
        chessBoard[i][j] = 1;

        for (let k = 0; k < count; k++) {
            if (wins[i][j][k]) {
                myWin[k]++;
                computerWin[k] = 6; // 該線路電腦已無法贏
                if (myWin[k] === 5) {
                    statusText.innerText = `恭喜 ${userName} 獲勝！`;
                    over = true;
                }
            }
        }
        if (!over) {
            me = !me;
            computerAI();
        }
    }
}

// --- 核心 AI：權重博弈算法 ---
function computerAI() {
    let myScore = [];
    let compScore = [];
    let max = 0;
    let u = 0, v = 0;

    for (let i = 0; i < 15; i++) {
        myScore[i] = [];
        compScore[i] = [];
        for (let j = 0; j < 15; j++) {
            myScore[i][j] = 0;
            compScore[i][j] = 0;
        }
    }

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (chessBoard[i][j] === 0) {
                for (let k = 0; k < count; k++) {
                    if (wins[i][j][k]) {
                        // --- 防守權重：如果你快贏了，電腦必須拼命擋 ---
                        if (myWin[k] === 1) myScore[i][j] += 200;      // 你有一顆
                        else if (myWin[k] === 2) myScore[i][j] += 1000;   // 你有兩顆
                        else if (myWin[k] === 3) myScore[i][j] += 5000;   // 你有三顆 (極度危險)
                        else if (myWin[k] === 4) myScore[i][j] += 20000;  // 你有四顆 (不擋就死)

                        // --- 進攻權重：電腦自己連線的權重 ---
                        if (computerWin[k] === 1) compScore[i][j] += 220;
                        else if (computerWin[k] === 2) compScore[i][j] += 1200;
                        else if (computerWin[k] === 3) compScore[i][j] += 6000;
                        else if (computerWin[k] === 4) compScore[i][j] += 50000; // 電腦要贏了
                    }
                }

                // 決定落子點：綜合考慮防守與進攻
                // 優先檢查玩家是否有威脅
                if (myScore[i][j] > max) {
                    max = myScore[i][j];
                    u = i; v = j;
                } else if (myScore[i][j] === max) {
                    if (compScore[i][j] > compScore[u][v]) {
                        u = i; v = j;
                    }
                }

                // 檢查電腦自己是否有更好的進攻點
                if (compScore[i][j] > max) {
                    max = compScore[i][j];
                    u = i; v = j;
                } else if (compScore[i][j] === max) {
                    if (myScore[i][j] > myScore[u][v]) {
                        u = i; v = j;
                    }
                }
            }
        }
    }

    // 如果棋盤全空（電腦先手），下在中間
    if (max === 0) {
        u = 7; v = 7;
    }

    oneStep(u, v, myColor !== 'black');
    chessBoard[u][v] = 2;
    for (let k = 0; k < count; k++) {
        if (wins[u][v][k]) {
            computerWin[k]++;
            myWin[k] = 6; // 標記玩家此線已廢
            if (computerWin[k] === 5) {
                statusText.innerText = "電腦贏了！看來這次它學聰明了。";
                over = true;
            }
        }
    }
    if (!over) me = !me;
}

function resetGame() {
    ctx.clearRect(0, 0, 450, 450);
    initData();
    drawBoard();
    over = false;
}

// 初始化
initData();
drawBoard();
