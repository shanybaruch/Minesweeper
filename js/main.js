'use strict'

var gBoard

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function buildBoard() {
    var board = []
    var cellsLocation = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        cellsLocation[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            cellsLocation[i][j] = { i, j }
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    //put random mines
    for (var z = 0; z < gLevel.MINES; z++) {
        drawCell(board)
    }

    setMinesNegsCount(board, cellsLocation)

    console.log(board);
    return board
}

function renderBoard(board) {
    var strHTML = `<table>`
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[i].length; j++) {
            var ifIsMine = (board[i][j].isMine) ? '💣' : board[i][j].minesAroundCount
            strHTML += `<td class="cell cell-${i}-${j} close" onclick="onCellClicked(this, ${i}, ${j})"></td>`
        }
        strHTML += `</tr>`
    }
    strHTML += `</table>`
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

//board.minesAroundCount
function setMinesNegsCount(board, cellsLocation) {

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cellLoc = cellsLocation[i][j]

            for (var ci = cellLoc.i - 1; ci <= cellLoc.i + 1; ci++) {
                for (var cj = cellLoc.j - 1; cj <= cellLoc.j + 1; cj++) {
                    //out of board
                    if (ci < 0 || ci >= gLevel.SIZE || cj < 0 || cj >= gLevel.SIZE) continue
                    //I am the cell
                    if (ci === i && cj === j) continue
                    //around the cell 
                    if (board[ci][cj].isMine) board[i][j].minesAroundCount++
                }
            }
        }
    }
}

function onCellClicked(elCell, i, j) {
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    //not used yet
    elCell.classList.remove('close')
    elCell.classList.add('open')

    var ifIsMine = (gBoard[i][j].isMine) ? '💣' : gBoard[i][j].minesAroundCount
    elCell.innerHTML = ifIsMine
}

function onCellMarked(elCell, i, j) {

}

function checkGameOver() {

}

function expandReveal(board, elCell, i, j) {

}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function drawCell(board) {
    //random i , j
    var i = getRandomInt(0, board.length)
    var j = getRandomInt(0, board[0].length)

    var cell = board[i][j]

    //if cell without mine, put mine. else, draw again
    if (!cell.isMine) {
        cell.isMine = true
        return cell
    } else {
        return drawCell(board)
    }
}