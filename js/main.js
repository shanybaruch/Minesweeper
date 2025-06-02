'use strict'

var gBoard
var gsecCountInterval
var gHintMode = false
var gChosenLevelBtn
var gBestScore = Infinity
var gBestScoreBeginner = Infinity
var gBestScoreMedium = Infinity
var gBestScoreExpert = Infinity
var gMegaHintFirst = null
var gMegaHintSecond = null
var gLastClick = []

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
    safeClicks: 3,
    megaHint: 1,
    megaHintMode: false
}

document.addEventListener('contextmenu', event => {
    event.preventDefault()
    renderFlag(event)
})

function changeMode(elBtn) {
    var elCon = document.querySelector('.container')
    elCon.classList.toggle('light-mode')
    document.body.classList.toggle('light-mode')

    if (document.body.classList.contains('light-mode')) {
        elBtn.innerText = '⚫'
    } else {
        elBtn.innerText = '⚪'
    }
}

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
        gGame.lives = 1
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
    resetClicks()
    resetTime()

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
            var isDark = document.body.classList.contains('dark-mode');

            strHTML += `<td class="cell cell-${i}-${j} close ${isDark ? 'dark-mode' : ''}" onclick="onCellClicked(this, ${i}, ${j})"></td>`
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
    // console.log(elCell);
    // console.log(gBoard[i][j]);
    var cell = gBoard[i][j]

    if (gBoard[i][j].isRevealed || gBoard[i][j].isMarked) return

    if (gGame.isOn) {

        if (!gGame.megaHintMode) {

            gLastClick.push([{ i, j }])

            // console.log('Clicked cell count:', gBoard[i][j].minesAroundCount)

            console.log(gLastClick);

            elCell.classList.remove('close')
            if (!gHintMode) {
                elCell.classList.add('open')
                gBoard[i][j].isRevealed = true
                gGame.revealedCount++
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
            if (!gHintMode) {
                if (gBoard[i][j].isMine) {
                    elCell.innerText = '💣'
                } else {
                    elCell.innerText = gBoard[i][j].minesAroundCount
                    uniqueColorForNum(elCell, i, j)
                    // console.log(gLastClick);


                    if (gBoard[i][j].minesAroundCount === 0 && !gGame.firstClick) {
                        uniqueColorForNum(elCell, i, j)
                        neighborsExpand(i, j)
                    }
                }
            }

            //when onclicked mine
            if (!gHintMode) {
                if (gBoard[i][j].isMine) {
                    if (!elCell.classList.contains('mine-open')) {
                        elCell.classList.add('mine-open')
                        gGame.lives--
                        renderLives()
                        renderSmiley()
                    }
                }
            }

            //onclick hint
            if (gHintMode) {
                if (!elCell.classList.contains('open')) {
                    hintCellsInLightOn(elCell, i, j)

                    setTimeout((i, j) => {
                        gHintMode = false
                        hintCellsInLightOff(elCell, i, j)
                        gGame.hints--
                        renderHints()
                    }, 1500)
                }
            }
        }

        if (gGame.megaHintMode) {
            if (!gMegaHintFirst) {
                gMegaHintFirst = { i, j }
            } else {
                gMegaHintSecond = { i, j }
                megaHint()

            }
        }

        //check game over
        checkGameOver()
        if (gGame.lives === 0) {
            gameOver()
        }
    }
}

function uniqueColorForNum(elCell, i, j) {
    if (!gHintMode) {
        if (gBoard[i][j].minesAroundCount === 0) {
            elCell.classList.add('zero')
        }
        if (gBoard[i][j].minesAroundCount === 1) {
            elCell.classList.add('one')
        }
        if (gBoard[i][j].minesAroundCount === 2) {
            elCell.classList.add('two')
        }
        if (gBoard[i][j].minesAroundCount === 3) {
            elCell.classList.add('three')
        }
        if (gBoard[i][j].minesAroundCount === 4) {
            elCell.classList.add('four')
        }
        if (gBoard[i][j].minesAroundCount === 5) {
            elCell.classList.add('five')
        }
        if (gBoard[i][j].minesAroundCount === 6) {
            elCell.classList.add('six')
        }
        if (gBoard[i][j].minesAroundCount === 7) {
            elCell.classList.add('seven')
        }
        if (gBoard[i][j].minesAroundCount === 8) {
            elCell.classList.add('eight')
        }
    }
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

function neighborsExpand(i, j) {
    var arrCells = []
    for (var ii = i - 1; ii <= i + 1; ii++) {
        for (var jj = j - 1; jj <= j + 1; jj++) {

            if (ii < 0 || ii >= gBoard.length || jj < 0 || jj >= gBoard[0].length) continue
            if (ii === i && jj === j) continue
            if (gBoard[ii][jj].isRevealed || gBoard[ii][jj].isMarked) continue;

            var elCell = document.querySelector(`.cell-${ii}-${jj}`)

            uniqueColorForNum(elCell, ii, jj)
            elCell.innerText = gBoard[ii][jj].minesAroundCount
            elCell.classList.remove('close')
            elCell.classList.add('open')
            gLastClick[gLastClick.length - 1].push({ i: ii, j: jj })
            // console.log(arrCells);


            if (gBoard[ii][jj].isRevealed && gBoard[ii][jj].minesAroundCount === 0) continue
            if (!gBoard[ii][jj].isRevealed && gBoard[ii][jj].minesAroundCount === 0) {
                gBoard[ii][jj].isRevealed = true
                neighborsExpand(ii, jj)
            }
            gBoard[ii][jj].isRevealed = true
            gGame.revealedCount++
            // console.log(arrCells);

        }
    }
    // console.log(gLastClick);
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

//make on hint
function onHint() {
    gHintMode = true
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
            if (ii < 0 || ii >= gBoard.length || jj < 0 || jj >= gBoard[0].length) continue
            var cell = document.querySelector(`.cell-${ii}-${jj}`)
            cell.classList.add('on-hint')
            // console.log(cell)

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
        if (cell.classList.contains('mine-open')) cell.classList.remove('mine-open')
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
                elCell.classList.add('mine-open')
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

//when begin game
function resetTime() {
    if (gsecCountInterval) {
        clearInterval(gsecCountInterval)
        var el = document.querySelector('.seconds-counter')
        el.innerText = gGame.secsPassed
    }
}

function resetClicks() {
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.firstClick = true
    gGame.mood = '😃'
    gGame.hints = 3
    gGame.megaHintMode = false
    gLastClick = []
    if (gGame.level === 'beginner') gGame.lives = 1
    else if (gGame.level === 'medium') gGame.lives = 2
    else gGame.lives = 3

    gGame.safeClicks = 3
    var btnSafeClick = document.querySelector('.safe-click')
    btnSafeClick.style.opacity = 1

    gGame.megaHint = 1
    var btnMegaHint = document.querySelector('.mega-hint')
    btnMegaHint.style.opacity = 1
}

function onSafeClicked(btn) {
    if (gGame.safeClicks > 0 && !gGame.firstClick) {
        var emptyCells = []
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (!gBoard[i][j].isRevealed && !gBoard[i][j].isMine) emptyCells.push({ i, j })
            }
        }

        var cell = getRandomInt(0, emptyCells.length - 1)
        var elCell = document.querySelector(`.cell-${emptyCells[cell].i}-${emptyCells[cell].j}`)

        elCell.classList.remove('close')
        elCell.classList.add('open')
        elCell.classList.add('on-hint')
        elCell.innerText = gBoard[emptyCells[cell].i][emptyCells[cell].j].minesAroundCount

        setTimeout(() => {
            elCell.classList.remove('open')
            elCell.classList.add('close')
            elCell.classList.remove('on-hint')
            elCell.innerText = ''
        }, 1500)
        gGame.safeClicks--
    }

    if (gGame.safeClicks === 0) {
        btn.style.opacity = 0.3
    }
}

function onUndoClicked() {
    // console.log(gLastClick)

    var lastClick = gLastClick.pop()
    if (!lastClick) return

    for (var i = 0; i < lastClick.length; i++) {

        var cell = lastClick[i]
        var elCell = document.querySelector(`.cell-${cell.i}-${cell.j}`)

        console.log(elCell);

        undoArrCells(elCell, cell.i, cell.j)
    }
}

function onMegaHintClicked() {
    gGame.megaHintMode = true
}

function megaHint() {
    var btnMegaHint = document.querySelector('.mega-hint')
    if (gGame.megaHint > 0 && !gGame.firstClick) {

        var cells = []
        for (var ii = gMegaHintFirst.i; ii <= gMegaHintSecond.i; ii++) {
            for (var jj = gMegaHintFirst.j; jj <= gMegaHintSecond.j; jj++) {
                cells.push({ i: ii, j: jj })
                var elCell = document.querySelector(`.cell-${ii}-${jj}`)
                elCell.classList.remove('close')
                elCell.classList.add('open')
                elCell.classList.add('on-hint')
                elCell.innerText = gBoard[ii][jj].minesAroundCount
            }
        }

        setTimeout(() => {

            for (var i = 0; i < cells.length; i++) {
                var elCell = document.querySelector(`.cell-${cells[i].i}-${cells[i].j}`)
                elCell.classList.remove('open')
                elCell.classList.add('close')
                elCell.classList.remove('on-hint')
                elCell.innerText = ''
            }
        }, 2000)
        gGame.megaHint--
        gGame.megaHintMode = false
    }

    if (gGame.megaHint === 0) btnMegaHint.style.opacity = 0.3
}

function undoArrCells(elCell, i, j) {
    // console.log(elCell)

    if (elCell.classList.contains('zero') ||
        elCell.classList.contains('one') ||
        elCell.classList.contains('two') ||
        elCell.classList.contains('three') ||
        elCell.classList.contains('four') ||
        elCell.classList.contains('five') ||
        elCell.classList.contains('six') ||
        elCell.classList.contains('seven') ||
        elCell.classList.contains('eight')
    ) {
        elCell.classList.remove('zero') ||
            elCell.classList.remove('one') ||
            elCell.classList.remove('two') ||
            elCell.classList.remove('three') ||
            elCell.classList.remove('four') ||
            elCell.classList.remove('five') ||
            elCell.classList.remove('six') ||
            elCell.classList.remove('seven') ||
            elCell.classList.remove('eight')
    }

    elCell.innerText = ''
    elCell.classList.remove('open')
    elCell.classList.add('close')

    gBoard[i][j].isRevealed = false


    gGame.revealedCount--
    // console.log(elCell);
}

function onExterminatorClicked() {
    
}