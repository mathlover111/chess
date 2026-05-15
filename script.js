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
    let u = 7, v = 7; // 預設落子中心

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
                        // 評估攔截玩家的必要性 (防守)
                        if (myWin[k] === 1) myScore[i][j] += 200;
                        else if (myWin[k] === 2) myScore[i][j] += 500;
                        else if (myWin[k] === 3) myScore[i][j] += 2000;
                        else if (myWin[k] === 4) myScore[i][j] += 10000;

                        // 評估電腦自身的勝算 (進攻)
                        if (computerWin[k] === 1) compScore[i][j] += 220;
                        else if (computerWin[k] === 2) compScore[i][j] += 550;
                        else if (computerWin[k] === 3) compScore[i][j] += 2200;
                        else if (computerWin[k] === 4) compScore[i][j] += 30000;
                    }
                }

                // 綜合判斷落子點
                if (myScore[i][j] > max) {
                    max = myScore[i][j]; u = i; v = j;
                } else if (myScore[i][j] === max) {
                    if (compScore[i][j] > compScore[u][v]) { u = i; v = j; }
                }

                if (compScore[i][j] > max) {
                    max = compScore[i][j]; u = i; v = j;
                } else if (compScore[i][j] === max) {
                    if (myScore[i][j] > myScore[u][v]) { u = i; v = j; }
                }
            }
        }
    }

    oneStep(u, v, myColor !== 'black');
    chessBoard[u][v] = 2;
    for (let k = 0; k < count; k++) {
        if (wins[u][v][k]) {
            computerWin[k]++;
            myWin[k] = 6;
            if (computerWin[k] === 5) {
                statusText.innerText = "電腦贏了！再接再厲！";
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
