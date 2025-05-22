'use strict'

var gBoard
var gsecCountInterval
var gHintMode = false
var gChosenLevelBtn
var gBestScore = Infinity
var gBestScoreBeginner = Infinity
var gBestScoreMedium = Infinity
var gBestScoreExpert = Infinity

var gLevel = {
    SIZE: 4,
    MINES: 2,
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
    bestScore: gBestScore,
    level: 'beginner',
}

document.addEventListener('contextmenu', event => {
    if (event.target.classList.contains('cell')) {
        event.preventDefault()
        renderFlag(event)
    }
})

function incrementSeconds() {
    var el = document.querySelector('.seconds-counter')
    gGame.secsPassed += 1
    el.innerText = gGame.secsPassed
}

function onLevelClicked(elLevel) {
    gChosenLevelBtn = elLevel
    whatLevel(elLevel)
    onInit()
}

function whatLevel(elLevel) {
    if (!elLevel || elLevel.classList.contains('beginner')) {
        gGame.level = 'beginner'
        gLevel.SIZE = 4
        gLevel.MINES = 2
    } else if (elLevel.classList.contains('medium')) {
        gGame.level = 'medium'
        gLevel.SIZE = 8
        gLevel.MINES = 14
    } else if (elLevel.classList.contains('expert')) {
        gGame.level = 'expert'
        gLevel.SIZE = 12
        gLevel.MINES = 32
    }
    return gLevel
}

function onInit() {
    gGame.isOn = true
    whatLevel(gChosenLevelBtn)
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.firstClick = true
    gGame.mood = '😃'
    gGame.hints = 3
    gGame.lives = 3
    //reset time
    if (gsecCountInterval) {
        clearInterval(gsecCountInterval)
        var el = document.querySelector('.seconds-counter')
        el.innerText = gGame.secsPassed
    }

    gBoard = buildBoard()
    renderBoard(gBoard)
    renderLives()
    renderSmiley()
    renderHints()
    renderBestScore()
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

function renderBestScore() {
    var elScore = document.querySelector('.best-score span')
    if (gGame.level === 'beginner') {
        elScore.innerText = gBestScoreBeginner === Infinity ? '' : gBestScoreBeginner
    } else if (gGame.level === 'medium') {
        elScore.innerText = gBestScoreMedium === Infinity ? '' : gBestScoreMedium
    } else if (gGame.level === 'expert') {
        elScore.innerText = gBestScoreExpert === Infinity ? '' : gBestScoreExpert
    }
}

function renderFlag(event) {

    var elCell = event.target

    //catch location class of cell top change obj ismarked
    var cellLoc = elCell.classList[1]
    var loc = cellLoc.split('-')
    var i = loc[1]
    var j = loc[2]

    if (elCell.innerText === '🚩') {
        elCell.classList.add('close')
        elCell.innerText = ''
        gGame.markedCount--
        gBoard[i][j].isMarked = false

    } else {
        elCell.classList.remove('close')
        elCell.innerText = '🚩'
        gGame.markedCount++
        gBoard[i][j].isMarked = true
    }

    gGame.markedCount++
    if (checkGameOver()) {
        victory()
    }
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

//how many times put random mines in cells
function randomMinesLocation(cellI, cellJ) {
    for (var i = 0; i < gLevel.MINES; i++) {
        drawMineCell(cellI, cellJ)
    }
}

function onCellClicked(elCell, i, j) {

    if (gGame.isOn) {
        // console.log(elCell);

        elCell.classList.remove('close')
        if (!gHintMode) {
            elCell.classList.add('open')
            gBoard[i][j].isRevealed = true
        }

        //if first click
        if (gGame.firstClick) {

            //Starting to count seconds
            gsecCountInterval = setInterval(incrementSeconds, 1000)

            //random cell selection for mines
            randomMinesLocation(i, j)

            //placing mines in cells
            var cellsLocation = placeMinesInCells()

            setMinesNegsCount(gBoard, cellsLocation)
            gGame.firstClick = false
        }

        //show value in cell or expand cells
        if (gBoard[i][j].isMine) {
            elCell.innerText = '💣'
        } else {
            elCell.innerText = gBoard[i][j].minesAroundCount
            gBoard[i][j].isRevealed = true
            gGame.revealedCount++
            if (gBoard[i][j].minesAroundCount === 0) {
                neighborsExpand(i, j)
            }
        }

        //when onclicked mine
        if (gBoard[i][j].isMine) {
            if (!elCell.classList.contains('mine-opens')) {
                elCell.classList.add('mine-opens')
                gGame.lives--
                renderLives()
                renderSmiley()
            }
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
}

function onHint() {
    gHintMode = true
}

function onCellMarked(elCell, i, j) {

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
function drawMineCell(cellI, cellJ) {

    //random i , j
    var i = getRandomInt(0, gBoard.length)
    var j = getRandomInt(0, gBoard[0].length)

    var randCell = gBoard[i][j]

    //if randCell without mine, put mine. else, draw again
    if (!randCell.isMine && !(i === cellI && j === cellJ)) {
        randCell.isMine = true
        return randCell
    } else {
        return drawMineCell(cellI, cellJ)
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

function neighborsExpand(i, j) {
//
}

//hint light 1.5 sec on
function hintCellsInLightOn(elCell, i, j) {
    //neighbors loop
    for (var ii = i - 1; ii <= i + 1; ii++) {
        for (var jj = j - 1; jj <= j + 1; jj++) {
            //out of board
            if (ii < 0 || ii >= gBoard.length || jj < 0 || jj >= gBoard[0].length) continue
            var cell = document.querySelector(`.cell-${ii}-${jj}`)
            cell.classList.add('on-hint')
            console.log(cell)

            var ifIsMine = (gBoard[ii][jj].isMine) ? '💣' : gBoard[ii][jj].minesAroundCount
            cell.innerHTML = ifIsMine
        }
    }
}

//hint light 1.5 sec off
function hintCellsInLightOff(elCell, i, j) {

    var cells = document.querySelectorAll(`.on-hint`)

    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i]
        cell.classList.remove('on-hint')
        if (cell.classList.contains('open')) continue
        cell.innerHTML = ''
        if (cell.classList.contains('mine-opens')) cell.classList.remove('mine-opens')
    }
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

function gameOver() {
    var elSmiley = document.querySelector('.mood-smiley')
    elSmiley.innerText = '🤯'
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.classList.add('mine-opens')
                elCell.innerText = '💣'
            }
        }
    }
    gGame.isOn = false
    clearInterval(gsecCountInterval)
}

function victory() {
    var elSmiley = document.querySelector('.mood-smiley')
    elSmiley.innerText = '😎'
    gGame.isOn = false
    clearInterval(gsecCountInterval)
    var thisScore = gGame.secsPassed
    saveBestScore(thisScore)
}

function saveBestScore(thisScore) {
    var elScore = document.querySelector('.best-score span')

    if (gGame.level === 'beginner') {
        if (thisScore < gBestScoreBeginner) {
            gBestScoreBeginner = thisScore
            elScore.innerText = gBestScoreBeginner
        }
    } else if (gGame.level === 'medium') {
        if (thisScore < gBestScoreMedium) {
            gBestScoreMedium = thisScore
            elScore.innerText = gBestScoreMedium
        }
    } else if (gGame.level === 'expert') {
        if (thisScore < gBestScoreExpert) {
            gBestScoreExpert = thisScore
            elScore.innerText = gBestScoreExpert
        }
    }
}
