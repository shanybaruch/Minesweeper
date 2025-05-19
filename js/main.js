'use strict'

var gBoard

var gLevel = {
    SIZE: 4,
    MINES: 3
}

var gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    firstClick: true,
    lives: 3,
    mood: '😃',
    hints: 3,
}

window.oncontextmenu = function (event) {
    renderFlag(event)
    return false
}

function renderFlag(event) {
    var elCell = event.target
    // console.log(elCell);
    elCell.innerText = '🚩'
    elCell.classList.remove('close')
    gGame.markedCount++
    checkGameOver()
}

function onInit() {
    gGame.firstClick = true
    gBoard = buildBoard()
    renderBoard(gBoard)
    gGame.lives = 3
    renderLives()
    gGame.mood = '😃'
    renderSmiley()
    gGame.markedCount = 0
    gGame.hints = 3
    renderHints()
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
    // console.log(board);
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
    //if first click
    if (gGame.firstClick) {

        //put random mines
        for (var z = 0; z < gLevel.MINES; z++) {
            drawCell(gBoard, i, j)
        }
        //put nums in cells
        var cellsLocation = []
        for (var ii = 0; ii < gBoard.length; ii++) {
            cellsLocation[ii] = []
            for (var jj = 0; jj < gBoard[0].length; jj++) {
                cellsLocation[ii][jj] = { i: ii, j: jj }
            }
        }

        setMinesNegsCount(gBoard, cellsLocation)
        gGame.firstClick = false
    }

    var elCell = document.querySelector(`.cell-${i}-${j}`)
    //not used yet
    elCell.classList.remove('close')
    elCell.classList.add('open')

    var ifIsMine = (gBoard[i][j].isMine) ? '💣' : gBoard[i][j].minesAroundCount
    elCell.innerHTML = ifIsMine

    //if onclicked mine
    if (gBoard[i][j].isMine) {
        elCell.classList.add('mine-opens')
        gGame.lives--
        renderLives()
        renderSmiley()
    }

    checkGameOver()

}

function onCellMarked(elCell, i, j) {

}

function checkGameOver() {
    //victory
    var elCells = document.querySelectorAll('.cell')
    for (var i = 0; i < elCells.length; i++) {
        if (elCells[i].classList.contains('close')) {
            return
        }
    }
    return victory()
}

function expandReveal(board, elCell, i, j) {

}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

//draw cells with mines 
function drawCell(board, cellI, cellJ) {
    // console.log(`cell clicked: ${cellI},${cellJ}`)

    //random i , j
    var i = getRandomInt(0, board.length)
    var j = getRandomInt(0, board[0].length)

    var cell = board[i][j]

    //if cell without mine, put mine. else, draw again
    if (!cell.isMine && cell !== board[cellI][cellJ]) {
        cell.isMine = true
        return cell
    } else {
        return drawCell(board, cellI, cellJ)
    }
}

//render lives
function renderLives() {
    var elLives = document.querySelector('.lives')
    var strLives = ''
    for (var i = 0; i < gGame.lives; i++) {
        strLives += '🤍'
    }
    elLives.innerText = strLives
}

//render smiley
function renderSmiley() {
    var elSmiley = document.querySelector('.mood-smiley')
    //game started
    elSmiley.innerText = '😃'

    //check lose
    if (gGame.lives === 0) {
        gameOver()
    }
}

//render hints
function renderHints() {
    var elHints = document.querySelector('.hints')
    var strHints = ''
    for (var i = 0; i < gGame.hints; i++) {
        strHints += '💡'
    }
    elHints.innerText = strHints
}

function gameOver() {
    var elSmiley = document.querySelector('.mood-smiley')
    elSmiley.innerText = '🤯'
}

function victory() {
    var elSmiley = document.querySelector('.mood-smiley')
    elSmiley.innerText = '😎'
}

function onHintClicked() {
    
}

