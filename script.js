const canvas = document.getElementById('chess');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('statusText');
const startBtn = document.getElementById('startBtn');

let chessBoard = []; // 棋盤紀錄
let me = true; // 輪到誰
let over = false;
let myColor = 'black'; // 玩家顏色
let userName = "玩家";

// 初始化棋盤數據
function initBoard() {
    for (let i = 0; i < 15; i++) {
        chessBoard[i] = [];
        for (let j = 0; j < 15; j++) {
            chessBoard[i][j] = 0;
        }
    }
}

// 繪製棋盤線條
function drawChessBoard() {
    ctx.strokeStyle = "#444";
    for (let i = 0; i < 15; i++) {
        ctx.moveTo(15 + i * 30, 15);
        ctx.lineTo(15 + i * 30, 435);
        ctx.stroke();
        ctx.moveTo(15, 15 + i * 30);
        ctx.lineTo(435, 15 + i * 30);
        ctx.stroke();
    }
}

// 畫棋子
function oneStep(i, j, isBlack) {
    ctx.beginPath();
    ctx.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);
    ctx.closePath();
    let gradient = ctx.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 13, 15 + i * 30 + 2, 15 + j * 30 - 2, 0);
    if (isBlack) {
        gradient.addColorStop(0, "#0A0A0A");
        gradient.addColorStop(1, "#636766");
    } else {
        gradient.addColorStop(0, "#D1D1D1");
        gradient.addColorStop(1, "#F9F9F9");
    }
    ctx.fillStyle = gradient;
    ctx.fill();
}

// 開始遊戲設定
startBtn.onclick = function() {
    userName = document.getElementById('playerName').value || "玩家";
    myColor = document.getElementById('playerColor').value;
    resetGame();
    
    if (myColor === 'white') {
        me = false;
        setTimeout(computerAI, 500); // 電腦先手(黑棋)
    } else {
        me = true;
    }
    statusText.innerText = `${userName} (${myColor === 'black' ? '黑子' : '白子'}) 對戰 電腦`;
}

// 點擊落子
canvas.onclick = function(e) {
    if (over || !me) return;
    let x = e.offsetX;
    let y = e.offsetY;
    let i = Math.floor(x / 30);
    let j = Math.floor(y / 30);

    if (chessBoard[i][j] === 0) {
        oneStep(i, j, myColor === 'black');
        chessBoard[i][j] = 1; // 玩家
        
        if (checkWin(i, j, 1)) {
            statusText.innerText = `恭喜 ${userName} 獲勝！`;
            over = true;
        } else {
            me = !me;
            computerAI();
        }
    }
};

// 簡單 AI 邏輯 (尋找最大權重點)
function computerAI() {
    if (over) return;
    let myScore = [];
    let computerScore = [];
    let max = 0;
    let u = 0, v = 0;

    // 此處簡化處理：AI 隨機尋找空位，並優先阻擋或進攻
    // 在 GitHub 專案中，你可以後續加入更複雜的「贏法陣列」演算法
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (chessBoard[i][j] === 0) {
                let score = Math.random() * 10; // 基礎隨機分
                // 這裡可以加入檢查周圍棋子的邏輯來增加分數
                if (score > max) {
                    max = score;
                    u = i; v = j;
                }
            }
        }
    }

    oneStep(u, v, myColor !== 'black');
    chessBoard[u][v] = 2; // 電腦
    
    if (checkWin(u, v, 2)) {
        statusText.innerText = "電腦獲勝，再接再厲！";
        over = true;
    } else {
        me = !me;
    }
}

// 勝負判定 (水平、垂直、兩條斜線)
function checkWin(x, y, role) {
    const directions = [[1,0], [0,1], [1,1], [1,-1]];
    for (let [dx, dy] of directions) {
        let count = 1;
        // 正向檢查
        let tx = x + dx, ty = y + dy;
        while(tx>=0 && tx<15 && ty>=0 && ty<15 && chessBoard[tx][ty] === role) {
            count++; tx += dx; ty += dy;
        }
        // 反向檢查
        tx = x - dx; ty = y - dy;
        while(tx>=0 && tx<15 && ty>=0 && ty<15 && chessBoard[tx][ty] === role) {
            count++; tx -= dx; ty -= dy;
        }
        if (count >= 5) return true;
    }
    return false;
}

function resetGame() {
    ctx.clearRect(0, 0, 450, 450);
    initBoard();
    drawChessBoard();
    over = false;
}

// 初始化繪製
initBoard();
drawChessBoard();
