let canvas = document.getElementById("drawer");
canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

let ctx = canvas.getContext("2d");

const dropTime = 1000; // time to drop piece in ms
let interval = null;

// helpers
const clamp = (num, min, max) => {
    return Math.min(max, Math.max(min, num));
};
const randInt = (max) => {
    return Math.floor(Math.random() * max);
};

const GAME_STATES = Object.freeze({
    playing: Symbol("playing"),
    paused: Symbol("paused"),
    gameOver: Symbol("gameOver"),
});

let Piece = function (data, width, height) {
    this.col = 0;
    this.row = 0;
    this.width = width;
    this.height = height;
    this.rotation = 0;
    this.data = data;
    this.color = "black";
    this.getData = () => {
        return this.data[this.rotation];
    };
    this.rotateClockWise = () => {
        this.rotation += 1;
        this.rotation = this.rotation % 4;
    };
    this.rotateCounterClockWise = () => {
        this.rotation += 3; // same as -1 mod 4
        this.rotation = this.rotation % 4;
    };
};
Piece.prototype.getColor = (num) => {
    let color;
    switch (num) {
        case 1:
            color = "aqua";
            break;
        case 2:
            color = "darkblue";
            break;
        case 3:
            color = "orange";
            break;
        case 4:
            color = "yellow";
            break;
        case 5:
            color = "chartreuse";
            break;
        case 6:
            color = "purple";
            break;
        case 7:
            color = "red";
            break;
        default:
            color = "black";
            break;
    }
    return color;
};

// begin pieces declaration
const iPiece = new Piece();
iPiece.color = "aqua";
iPiece.data = [
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
];
iPiece.width = 4;
iPiece.height = 4;

const jPiece = new Piece();
jPiece.data = [
    [2, 0, 0, 2, 2, 2, 0, 0, 0],
    [0, 2, 2, 0, 2, 0, 0, 2, 0],
    [0, 0, 0, 2, 2, 2, 0, 0, 2],
    [0, 2, 0, 0, 2, 0, 2, 2, 0],
];
jPiece.width = 3;
jPiece.height = 3;
jPiece.color = "darkblue";

const lPiece = new Piece();
lPiece.data = [
    [0, 0, 3, 3, 3, 3, 0, 0, 0],
    [0, 3, 0, 0, 3, 0, 0, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 0, 0],
    [3, 3, 0, 0, 3, 0, 0, 3, 0],
];
lPiece.width = 3;
lPiece.height = 3;
lPiece.color = "orange";

const squarePiece = new Piece();
squarePiece.data = [
    [4, 4, 4, 4],
    [4, 4, 4, 4],
    [4, 4, 4, 4],
    [4, 4, 4, 4],
];
squarePiece.width = 2;
squarePiece.height = 2;
squarePiece.color = "yellow";

const sPiece = new Piece();
sPiece.data = [
    [0, 5, 5, 5, 5, 0, 0, 0, 0],
    [0, 5, 0, 0, 5, 5, 0, 0, 5],
    [0, 0, 0, 0, 5, 5, 5, 5, 0],
    [5, 0, 0, 5, 5, 0, 0, 5, 0],
];
sPiece.width = 3;
sPiece.height = 3;
sPiece.color = "chartreuse";

const tPiece = new Piece();
tPiece.data = [
    [0, 6, 0, 6, 6, 6, 0, 0, 0],
    [0, 6, 0, 0, 6, 6, 0, 6, 0],
    [0, 0, 0, 6, 6, 6, 0, 6, 0],
    [0, 6, 0, 6, 6, 0, 0, 6, 0],
];
tPiece.width = 3;
tPiece.height = 3;
tPiece.color = "purple";

const zPiece = new Piece();
zPiece.data = [
    [7, 7, 0, 0, 7, 7, 0, 0, 0],
    [0, 0, 7, 0, 7, 7, 0, 7, 0],
    [0, 0, 0, 7, 7, 0, 0, 7, 7],
    [0, 7, 0, 7, 7, 0, 7, 0, 0],
];
zPiece.width = 3;
zPiece.height = 3;
zPiece.color = "red";

// end piece declaration

const pieces = [iPiece, jPiece, lPiece, squarePiece, tPiece, zPiece, sPiece];

let Board = function () {
    this.boardWidth = 10;
    this.boardHeight = 20;
    this.data = Array(this.boardWidth * this.boardHeight).fill(0);
    this.get = (row, col) => {
        return this.data[row * this.boardWidth + col];
    };
    this.canFitPiece = (piece, row, col) => {
        // if (col > board.boardWidth - piece.width || row > board.boardHeight - piece.height || col < 0 || row < 0) {
        //     return false;
        // }

        for (let i = 0; i < piece.height; i++) {
            for (let j = 0; j < piece.width; j++) {
                let pieceIndex = i * piece.width + j;
                let thisIndex = (i + row) * this.boardWidth + j + col;
                if (
                    piece.getData()[pieceIndex] != 0 &&
                    (this.data[thisIndex] != 0 ||
                        row + i >= this.boardHeight ||
                        col + j >= this.boardWidth ||
                        col + j < 0)
                ) {
                    console.log(j, this.boardWidth);
                    return false;
                }
            }
        }
        return true;
    };
    this.addPiece = (piece, row, col) => {
        let modifiedRows = [];
        for (let i = 0; i < piece.height; i++) {
            for (let j = 0; j < piece.width; j++) {
                let pieceIndex = i * piece.width + j;
                let thisIndex = (i + row) * this.boardWidth + j + col;
                if (piece.getData()[pieceIndex] != 0) {
                    this.data[thisIndex] = piece.getData()[pieceIndex];
                    modifiedRows.push(i + row);
                }
            }
        }
        return modifiedRows;
    };
    this.drawBoard = () => {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, this.boardWidth * renderer.cellSize, this.boardHeight * renderer.cellSize);
        for (let i = 0; i < this.boardHeight; i++) {
            for (let j = 0; j < this.boardWidth; j++) {
                if (this.get(i, j) != 0) {
                    let color = currentPiece.getColor(this.get(i, j));
                    renderer.drawSquare(i, j, color);
                }
            }
        }
    };
    this.drawPiece = (piece) => {
        for (let i = 0; i < piece.height; i++) {
            for (let j = 0; j < piece.width; j++) {
                let pieceIndex = i * piece.width + j;
                if (piece.getData()[pieceIndex] != 0) {
                    renderer.drawSquare(i + piece.row, j + piece.col, piece.color);
                }
            }
        }
    };
    this.removeRows = (rows) => {
        let newData = Array(this.boardWidth * this.boardHeight).fill(0);
        let rowIndex = this.boardHeight - 1;
        for (let i = rowIndex; i >= 0; i--) {
            if (!rows.includes(i)) {
                console.log("sus");
                for (let j = 0; j < this.boardWidth; j++) {
                    newData[rowIndex * this.boardWidth + j] = this.get(i, j);
                }
                rowIndex--;
            }
        }
        this.data = newData;
    };
    this.checkRows = (rowsToCheck) => {
        let fullRows = [];
        rowsToCheck.forEach((i) => {
            let full = true;
            for (let j = 0; j < this.boardWidth; j++) {
                if (this.get(i, j) === 0) {
                    full = false;
                }
            }
            if (full) {
                fullRows.push(i);
            }
        });
    };
};

function Renderer() {
    this.cellSize = 32;
    this.drawSquare = (row, col, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
    };
}

let board = new Board();
let currentPiece = pieces[randInt(pieces.length)];
let renderer = new Renderer();
let currentState = GAME_STATES.playing;
let heldPiece = null;

function draw(now) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    board.drawBoard();
    board.drawPiece(currentPiece);
    if (currentState == GAME_STATES.paused) {
        ctx.fillStyle = "black";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }
}

function logic(time) {
    if (time > nextTime) {
        nextTime = time + dropTime;
        if (!tryMove(0, 1)) {
            board.addPiece(currentPiece, currentPiece.row, currentPiece.col);
            resetPiece();
        }
    }
}

function loop(time) {
    if (currentState == GAME_STATES.playing) {
        logic(time);
        draw(time);
    }
    if (currentState != GAME_STATES.gameOver) {
        requestAnimationFrame(loop);
    }
}

function instantDrop() {
    while (tryMove(1, 0)) {}
    board.addPiece(currentPiece, currentPiece.row, currentPiece.col);
    resetPiece();
    draw();
}

function holdPiece() {
    let oldCol = currentPiece.col;
    if (heldPiece == null) {
        heldPiece = currentPiece;
        currentPiece = pieces[randInt(pieces.length)];
    } else {
        let temp = heldPiece;
        heldPiece = currentPiece;
        currentPiece = temp;
    }
    currentPiece.row = 0;
    currentPiece.col = oldCol;
    currentPiece.rotation = 0;
    draw();
}

function togglePause() {
    if (currentState == GAME_STATES.playing) {
        currentState = GAME_STATES.paused;
    } else if (currentState == GAME_STATES.paused) {
        currentState = GAME_STATES.playing;
    }
    draw();
}

function tryMove(deltaRow, deltaColumn) {
    let newCol = currentPiece.col + deltaColumn;
    let newRow = currentPiece.row + deltaRow;
    if (board.canFitPiece(currentPiece, newRow, newCol)) {
        currentPiece.col = newCol;
        currentPiece.row = newRow;
        draw();
        return true;
    }
    return false;
}

function keyInput(event) {
    switch (event.key) {
        case "ArrowLeft":
            tryMove(0, -1);
            break;
        case "ArrowRight":
            tryMove(0, 1);
            break;
    }

    if (!event.repeat) {
        switch (event.key) {
            case "ArrowUp":
                instantDrop();
                break;
            case "ArrowDown":
                if (!tryMove(1, 0)) {
                    board.addPiece(currentPiece, currentPiece.row, currentPiece.col);
                    resetPiece();
                    draw();
                }
                break;
            case "Shift":
                holdPiece();
                break;
            case "Escape":
                togglePause();
                break;
            case "x":
                rotateClockWise();
                break;
            case "z":
                rotateCounterClockWise();
                break;
        }
    }

    // currentPiece.col = clamp(currentPiece.col, 0, board.boardWidth);
    // currentPiece.row = clamp(currentPiece.row, 0, board.boardHeight);
}

function resetPiece() {
    let oldCol = currentPiece.col;
    currentPiece = pieces[randInt(pieces.length)];
    currentPiece.row = 0;
    currentPiece.col = clamp(oldCol, 0, board.boardWidth - currentPiece.width);
    currentPiece.rotation = 0;
}

function gameMovePiece() {
    if (currentState == GAME_STATES.gameOver && interval != null) {
        clearInterval(interval);
    }
    let moveSuccessful = tryMove(1, 0);
    if (!moveSuccessful) {
        board.addPiece(currentPiece, currentPiece.row, currentPiece.col);
        resetPiece();
    }
}

function rotateCounterClockWise() {
    currentPiece.rotateCounterClockWise();
    if (!board.canFitPiece(currentPiece, currentPiece.row, currentPiece.col)) {
        currentPiece.rotateClockWise();
    }
    draw();
}

function rotateClockWise() {
    currentPiece.rotateClockWise();
    if (!board.canFitPiece(currentPiece, currentPiece.row, currentPiece.col)) {
        currentPiece.rotateCounterClockWise();
    }
    draw();
}

function init() {
    currentPiece.col = Math.floor(board.boardWidth / 2);
    document.addEventListener("keydown", keyInput);
    board.data = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 4, 4, 0, 6, 0, 0, 0, 1, 0, 0, 4, 4, 6, 6, 0, 0, 0, 1, 4, 4, 1, 2, 2, 6, 2, 2, 1, 1, 4, 4, 1, 2, 4, 4, 2,
        0, 1, 1, 3, 3, 1, 2, 4, 4, 2, 7, 1, 4, 4, 3, 1, 4, 4, 1, 7, 7, 1, 4, 4, 3, 6, 4, 4, 1, 7, 4, 4, 2, 0, 6, 6, 4,
        4, 1, 2, 4, 4, 2, 2, 2, 6, 4, 4, 1, 2, 2, 2,
    ];
    draw();
    // interval = setInterval(gameMovePiece, dropTime);
}

init();
