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

var gHintMode = false

document.addEventListener('contextmenu', event => {
    if (event.target.classList.contains('cell')) {
        event.preventDefault()
        renderFlag(event)
    }
})

function renderFlag(event) {

    var elCell = event.target

    if (elCell.innerText === '🚩') {
        elCell.classList.add('close')

        elCell.innerText = ''
    } else {
        elCell.classList.remove('close')
        elCell.innerText = '🚩'
    }

    gGame.markedCount++
    if (checkGameOver()) {
        victory()
    }
}

function onInit() {
    gGame.isOn = true
    gGame.markedCount = 0
    gGame.firstClick = true
    gGame.lives = 3
    gGame.mood = '😃'
    gGame.hints = 3

    gBoard = buildBoard()
    renderBoard(gBoard)
    renderLives()
    renderSmiley()
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

//random cell selection for mines
function randomMinesLocation(i, j) {
    for (var z = 0; z < gLevel.MINES; z++) {
        drawCell(gBoard, i, j)
    }
}

function onCellClicked(elCell, i, j) {

    elCell.classList.remove('close')
    elCell.classList.add('open')

    //if first click
    if (gGame.firstClick) {

        //random cell selection for mines
        randomMinesLocation(i, j)

        //placing mines in cells
        var cellsLocation = placeMinesInCells()

        setMinesNegsCount(gBoard, cellsLocation)
        gGame.firstClick = false
    }

    //show value in cell
    var ifIsMine = (gBoard[i][j].isMine) ? '💣' : gBoard[i][j].minesAroundCount
    elCell.innerHTML = ifIsMine

    //when onclicked mine
    if (gBoard[i][j].isMine) {
        elCell.classList.add('mine-opens')
        gGame.lives--
        renderLives()
        renderSmiley()
    }

    //onclick hint
    if (gHintMode) {

        if (!elCell.classList.contains('opens')) {
            hintCellsInLightOn(elCell, i, j)

            setTimeout((i, j) => {
                gHintMode = false
                hintCellsInLightOff(elCell, i, j)
                gGame.hints--
                renderHints()
            }, 1500)
        }
    }

    //check game over
    checkGameOver()
    if (gGame.lives === 0) {
        gameOver()
    }
}

function onHint(elHint) {
    gHintMode = true
}

function onCellMarked(elCell, i, j) {

}

function checkGameOver() {

    //check victory
    var elCells = document.querySelectorAll('.cell')
    for (var i = 0; i < elCells.length; i++) {
        if (elCells[i].classList.contains('close')) {
            return false
        }
    }
    victory()
    return true
}

function expandReveal(board, elCell, i, j) {

}

function placeMinesInCells() {
    var cellsLocation = []
    for (var i = 0; i < gBoard.length; i++) {
        cellsLocation[i] = []
        for (var j = 0; j < gBoard[0].length; j++) {
            cellsLocation[i][j] = { i: i, j: j }
        }
    }
    return cellsLocation
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

//draw cells with mines 
function drawCell(board, cellI, cellJ) {

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
    var elHints = document.querySelector('.hint')
    var strHints = ''
    for (var i = 0; i < gGame.hints; i++) {
        strHints += '💡'
    }
    elHints.innerText = strHints
}

//hint light 1.5 sec on
function hintCellsInLightOn(elCell, i, j) {
    //neighbors loop
    for (var ii = i - 1; ii <= i + 1; ii++) {
        for (var jj = j - 1; jj <= j + 1; jj++) {
            //out of board
            if (ii < 0 || ii >= gBoard.length || jj < 0 || jj >= gBoard.length) continue
            var cell = document.querySelector(`.cell-${ii}-${jj}`)
            cell.classList.add('on-hint')
            var ifIsMine = (gBoard[ii][jj].isMine) ? '💣' : gBoard[ii][jj].minesAroundCount
            cell.innerHTML = ifIsMine
        }
    }
}

//hint light 1.5 sec off
function hintCellsInLightOff(elCell, i, j) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = document.querySelector(`.on-hint`)
            cell.classList.remove('on-hint')
            var ifIsMine = (gBoard[i][j].isMine) ? '💣' : gBoard[i][j].minesAroundCount
            cell.innerHTML = ''
        }
    }
}

function gameOver() {
    var elSmiley = document.querySelector('.mood-smiley')
    elSmiley.innerText = '🤯'
    gGame.isOn = false
}

function victory() {
    var elSmiley = document.querySelector('.mood-smiley')
    elSmiley.innerText = '😎'
    gGame.isOn = false
}
