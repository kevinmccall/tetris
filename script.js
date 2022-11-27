let canvas = document.getElementById("drawer");
let ctx = canvas.getContext("2d");

let nextTime = 1;
let dropTime = 1000; // time to drop piece in ms

let playing = true;
let isPaused = false;


let Board = function () {
    this.boardWidth = 10;
    this.boardHeight = 20;
    this.data = Array(this.boardWidth * this.boardHeight).fill(0);
    this.get = (row,col) => {return this.data[row * this.boardWidth + col]};
    this.canFitPiece = (piece, row, col) => {
        for (let i = 0; i < piece.height; i++) {
            for (let j = 0; j < piece.width; j++) {
                let pieceIndex = i * piece.width + j;
                let thisIndex = (i + row) * this.boardWidth + j + col;
                if (piece.data[pieceIndex] != 0 && this.data[thisIndex] != 0) {
                    return false;
                }
            }
        }
        return true;
    };
    this.addPiece = (piece, row, col) => {
        for (let i = 0; i < piece.height; i++) {
            for (let j = 0; j < piece.width; j++) {
                let pieceIndex = i * piece.width + j;
                let thisIndex = (i + row) * this.boardWidth + j + col;
                if (piece.data[pieceIndex] != 0) {
                    this.data[thisIndex] = piece.data[pieceIndex];
                }
            }
        }
    }
    this.drawBoard = () => {
        ctx.fillStyle = "gray";
        ctx.fillRect(0,0, this.boardWidth * renderer.cellSize, this.boardHeight * renderer.cellSize)
        for (let i = 0; i < this.boardHeight; i++) {
            for (let j = 0; j < this.boardWidth; j++) {
                if (this.get(i,j) != 0) {
                    renderer.drawSquare(i,j, "purple");
                }
            }
        }
    }
    this.drawPiece = (piece) => {
        for (let i = 0; i < piece.height; i++) {
            for (let j = 0; j < piece.width; j++) {
                let pieceIndex = i * piece.width + j;
                if (piece.data[pieceIndex] != 0) {
                    renderer.drawSquare(i + piece.row, j + piece.col, "pink")
                }
            }
        }
    }
}

let Piece = function(data, width, height) {
    this.col = 0;
    this.row = 0;
    this.width = width;
    this.height = height;
    this.rotation = 0;
    this.data =  
    [
        0, 1, 
        0, 1,
        1, 1,
    ];
    this.getData = () => {
        return this.data[this.rotation]
    }
    this.reset = () => {
        this.col = 0;
        this.row = 0;
    }
    this.prototype.rotateClockWise = () => {
        this.rotation += 1;
        this.rotation = this.rotation % 4;
    };
    this.prototype.rotateCounterClockWise = () => {
        this.rotation += 3; // same as -1 mod 4
        this.rotation = this.rotation % 4;
    };
}

// begin pieces declaration
const iPiece = new Piece();
iPiece.data = [1,1,1,1]
iPiece.width = 4;
iPiece.height = 1;

const lPiece = new Piece();
lPiece.data = [
    1, 0, 0,
    1, 1, 1
]
lPiece.width = 3;
lPiece.height = 2;

const lPiece2 = new Piece();
lPiece2.data = [
    0, 0, 1,
    1, 1, 1
];
lPiece2.width = 3;
lPiece2.height = 2;

const squarePiece = new Piece();
squarePiece.data = [
    1, 1,
    1, 1
];
squarePiece.width = 2;
squarePiece.height = 2;

const tPiece = new Piece();
tPiece.data = [
    0, 1, 0,
    1, 1, 1
];
tPiece.width = 3;
tPiece.height = 2;

const zPiece = new Piece();
zPiece.data = [
    1, 1, 0,
    0, 1, 1
];
zPiece.width = 3;
zPiece.height = 2;

const zPiece2 = new Piece();
zPiece2.data = [
    0, 1, 1,
    1, 1, 0
];
zPiece2.width = 3;
zPiece2.height = 2;
// end piece declaration

let board = new Board();
let currentPiece = new Piece();

function Renderer() {
    this.cellSize = 32;
    this.drawSquare = (row, col, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(col * this.cellSize, row*this.cellSize, this.cellSize, this.cellSize);
    }
}

let renderer = new Renderer();

canvas.width = window.innerWidth- 10;
canvas.height = window.innerHeight- 10;

const clamp = (num, min, max) => {return Math.min(max, Math.max(min,num))}

function draw(now) {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0, canvas.width, canvas.height);
    board.drawBoard();
    board.drawPiece(currentPiece);
    if (isPaused) {
        ctx.fillStyle = "black";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }
}

function logic(time) {
    if (time > nextTime) {
        console.log(nextTime)
        nextTime = time + dropTime;
        if (!tryMove(0, 1)) {
            board.addPiece(currentPiece, currentPiece.row, currentPiece.col);
            currentPiece.reset();
        }
    }
}

function loop(time) {
    if (!isPaused) {
        logic(time);
    }
    draw(time);
    if (playing) {
        requestAnimationFrame(loop);
    }
}

function instantDrop() {
    while (board.canFitPiece(currentPiece,currentPiece.row + 1, currentPiece.col)) {
        currentPiece.row += 1;
    }
    board.addPiece(currentPiece, currentPiece.row, currentPiece.col);
    currentPiece.reset();
}

function holdPiece() {

}

function togglePause() {
    isPaused = !isPaused;
}

function tryMove(offsetX, offsetY) {
    let newCol = currentPiece.col + offsetX;
    let newRow = currentPiece.row + offsetY;
    if (board.canFitPiece(currentPiece, newRow, newCol)) {
        currentPiece.col = newCol;
        currentPiece.row = newRow;
        return true;
    }
    return false;
}

function keyInput(event) {
    if (event.repeat) {
        return
    }

    switch (event.key) {
        case "ArrowUp":
            instantDrop();
            break;
        case "ArrowDown":
            tryMove(0, 1);
            break;
        case "ArrowLeft":
            tryMove(-1, 0);
            break;
        case "ArrowRight":
            tryMove(1, 0);
            break;
        case "Shift":
            holdPiece();
            break;
        case "Escape":
            togglePause();
            break;
    }
    currentPiece.col = clamp(currentPiece.col, 0, board.boardWidth - currentPiece.width);
    currentPiece.row = clamp(currentPiece.row, 0, board.boardHeight - currentPiece.height)
}    
        
document.addEventListener('keydown', keyInput);
loop(0);