const rows = 3
const cols = 3
const boxes = []
const queueOfZeroes = []
const queueOfCrosses = []
const vsBot = true
const player = 0
const bot = 1
let gameOver = false
const possibleWinPositions = {
  'ROW1':'row1',
  'ROW2':'row2',
  'ROW3':'row3',
  'COL1':'col1',
  'COL2':'col2',
  'COL3':'col3',
  'DIA1':'dia1',
  'DIA2':'dia2',
}
let winPosition = ''

let currentPlayer = 0 // 0: O | 1: X

document.querySelectorAll('.restart-btn').forEach(btn => btn.addEventListener('click', function() {
  location.reload()
}))

for(let row = 0; row < rows; row++) {
  let currentRow = []
  for(let col = 0; col < cols; col++) {
    const boxEle = document.querySelector(`.box-${row+1}${col+1}`)
    currentRow.push({element: boxEle, marked: false, value: null})
    handleBoxHovers(boxEle, row, col)
    handleBoxClick(boxEle, row, col)
  }
  boxes.push(currentRow)
}

function handleBoxHovers(boxEle, row, col) {
  boxEle.addEventListener("mouseover", () => {
    if(gameOver) return
    if(boxes[row] && boxes[row][col] && boxes[row][col].marked) return
    boxEle.classList.add(currentPlayer === 1 ? 'cross-hover' : 'circle-hover')
  })
  boxEle.addEventListener("mouseout", () => {
    boxEle.classList.remove('cross-hover', 'circle-hover')
  })
}


function handleBoxClick(boxEle, row, col) {
  boxEle.addEventListener("click", () => {
    if(gameOver) return
    if(boxes[row] && boxes[row][col] && boxes[row][col].marked) return
    const value = currentPlayer
    markTheTerritory(boxEle, row, col)
    if(value === 1) {
      handleCross(boxEle, row, col)
    }else {
      handleZero(boxEle, row, col)
    }
    Promise.resolve().then(() => {
      if(vsBot && value === 0 && !gameOver) runBot()
    })
  })
}

function markTheTerritory(boxEle, row, col, botTurn=false) {
  let value = currentPlayer
  if(!vsBot || value === 0 || botTurn) {
    boxEle.classList.remove('cross-hover', 'circle-hover')
    boxEle.classList.add(currentPlayer === 1 ? 'cross' : 'circle')
    boxEle.setAttribute('data-value', '2️⃣')
    let marked = true
    currentPlayer = currentPlayer === 1 ? 0 : 1
    boxes[row][col] = {element: boxEle, marked, value}
  }
}

function runBot() {
  Promise.resolve().then(() => {
    // Promised in order to run this only after the previous code is done running
    const potentialWinPosition = checkIfAboutToWin(bot)
    const potentialOpponentWinPosition = checkIfAboutToWin(player)
    if(potentialWinPosition || potentialOpponentWinPosition) {
      console.log(potentialWinPosition ? 'Smart Win Move -> '+potentialWinPosition : 'Smart Block -> '+ potentialOpponentWinPosition)
      const [row,col] = potentialWinPosition || potentialOpponentWinPosition
      const boxEle = document.querySelector(`.box-${row+1}${col+1}`)
      markTheTerritory(boxEle, row, col, true)
      handleCross(boxEle, row, col)
    }else {
      console.log('Random Move ')
      let randomRow = getRandomNumber()
      let randomCol = getRandomNumber()
    
      while(boxes[randomRow][randomCol].marked) {
        randomRow = getRandomNumber()
        randomCol = getRandomNumber()
      }
    
      const boxEle = document.querySelector(`.box-${randomRow+1}${randomCol+1}`)
      markTheTerritory(boxEle, randomRow, randomCol, true)
      handleCross(boxEle, randomRow, randomCol)
    }
  })
}

function handleCross(boxEle, row, col) {
  queueOfCrosses.forEach((el, idx) => {
    const currentValue = el.remaining
    if(currentValue == 1){ 
      el.element.classList.add('vanishing')

    }
    const value = el.remaining === 2 ? '1️⃣' : '🔴'
    el.element.setAttribute('data-value', value) 
    queueOfCrosses[idx] = {...el, remaining: el.remaining-1}
  })
  queueOfCrosses.push({element: boxEle, row, col, remaining: 2})
  if(queueOfCrosses.length > 3) {
    const elementToRemove = queueOfCrosses.shift()
    elementToRemove.element.classList.remove('cross', 'circle', 'vanishing')
    elementToRemove.element.setAttribute('data-value', '')
    boxes[elementToRemove.row][elementToRemove.col] = {element: elementToRemove, marked: false, value: null}
  }

  Promise.resolve().then(() => {
    // Promised in order to run this only after the previous code is done running
    checkIfWon()
  })
}

function handleZero(boxEle, row, col) {
  queueOfZeroes.forEach((el, idx) => {
    const currentValue = el.remaining
    if(currentValue == 1) el.element.classList.add('vanishing')
    const value = el.remaining === 2 ? '1️⃣' : '🔴'
    el.element.setAttribute('data-value', value)
    queueOfZeroes[idx] = {...el, remaining: el.remaining-1}
  })
  queueOfZeroes.push({element: boxEle, row, col, remaining: 2})
  if(queueOfZeroes.length > 3) {
    const elementToRemove = queueOfZeroes.shift()
    elementToRemove.element.classList.remove('cross', 'circle', 'vanishing')
    elementToRemove.element.setAttribute('data-value', '')
    boxes[elementToRemove.row][elementToRemove.col] = {element: elementToRemove, marked: false, value: null}
  }

  Promise.resolve().then(() => {
    // Promised in order to run this only after the previous code is done running
    checkIfWon()
  })
}


function getRandomNumber() {
  return Math.floor(Math.random() * 3)
}

function checkIfWon() {
  const isWon = checkRows() || checkCols() || checkDiagonals()
  if(!isWon) return
  gameOver = true
  document.querySelector('.game-over-overlay').classList.add('show')
  document.querySelector('.who-won').innerText = currentPlayer === 1 ? 'You Won!' : 'Bot Won!'
  const grid = document.querySelector('.grid-container')
  grid.classList.add('mark', `${winPosition}`)
  console.log('WON!');
}

function checkIfAboutToWin(player) {
  let aboutToVanish = queueOfCrosses.length === 3 && queueOfCrosses[0]
  if(player === 0) aboutToVanish = queueOfZeroes.length === 3 && queueOfZeroes[0]
  const potentialRow = checkRowsIfAboutToWin(player, aboutToVanish)
  const potentialCol = checkColsIfAboutToWin(player, aboutToVanish)
  const potentialDia = checkDiagonalsIfAboutToWin(player, aboutToVanish)
  if(potentialRow) return potentialRow
  if(potentialCol) return potentialCol
  if(potentialDia) return potentialDia
  return null
}

function checkRows() {
  for(let row = 0; row < rows; row++) {
    const currenRowValue = boxes[row][0].value
    for(let col = 0; col < cols; col++) {
      if(!boxes[row][col].marked || boxes[row][col].value !== currenRowValue){
        break
      }
      if(col === cols-1) {
        winPosition = possibleWinPositions[`ROW${row+1}`]
        return true
      }
    }
  }
  return false
}

function checkRowsIfAboutToWin(player, aboutToVanish) {
  for(let row = 0; row < rows; row++) {
    let currentRowCount = 0
    let potentialWinPosition = null
    for(let col = 0; col < cols; col++) {
      if(aboutToVanish.row === row && aboutToVanish.col === col) continue
      if(boxes[row][col].marked && boxes[row][col].value === player) currentRowCount++
      else if(!boxes[row][col].marked) potentialWinPosition = [row,col]
    }
    if(currentRowCount === 2) {
      return potentialWinPosition
    }
  }
  return null
}

function checkCols() {
  for(let col = 0; col < cols; col++) {
    const currenColValue = boxes[0][col].value
    for(let row = 0; row < rows; row++) {
      if(!boxes[row][col].marked || boxes[row][col].value !== currenColValue){
        break
      }
      if(row === rows-1) {
        winPosition = possibleWinPositions[`COL${col+1}`]
        return true
      }
    }
  }
}

function checkColsIfAboutToWin(player, aboutToVanish) {
  for(let col = 0; col < cols; col++) {
    let currentColCount = 0
    let potentialWinPosition = null
    for(let row = 0; row < rows; row++) {
      if(aboutToVanish.row === row && aboutToVanish.col === col) continue
      if(boxes[row][col].marked && boxes[row][col].value === player) currentColCount++
      else if(!boxes[row][col].marked) potentialWinPosition = [row,col]
    }
    if(currentColCount === 2) {
      return potentialWinPosition
    }
  }
  return null
}

function checkDiagonals() {
  const possibleValue1 = boxes[0][0].value
  const possibleValue2 = boxes[0][cols-1].value
  for(let i = 0; i < rows; i++) {
    if(!boxes[i][i].marked || boxes[i][i].value !== possibleValue1){
      break
    }
    if(i === rows-1) {
      winPosition = possibleWinPositions[`DIA1`]
      return true
    }
  }
  for(let i = 0; i < rows; i++) {
    if(!boxes[i][cols-i-1].marked || boxes[i][cols-i-1].value !== possibleValue2){
      break
    }
    if(i === rows-1) {
      winPosition = possibleWinPositions[`DIA2`]
      return true
    }
  }
  return false
}

function checkDiagonalsIfAboutToWin(player, aboutToVanish) {
  let currentDiaCount = 0
  let potentialWinPosition = null
  for(let i = 0; i < rows; i++) {
    if(aboutToVanish.row === i && aboutToVanish.col === i) continue
    if(boxes[i][i].marked && boxes[i][i].value === player) currentDiaCount++
    else if(!boxes[i][i].marked) potentialWinPosition = [i,i]
    }
  if(currentDiaCount === 2) {
    return potentialWinPosition
  }
  currentDiaCount = 0
  potentialWinPosition = null 
  for(let i = 0; i < rows; i++) {
    if(aboutToVanish.row === i && aboutToVanish.col === rows-i-1) continue
    if(boxes[i][rows-i-1].marked && boxes[i][rows-i-1].value === player) currentDiaCount++
    else if(!boxes[i][rows-i-1].marked) potentialWinPosition = [i,rows-i-1]
    }
  if(currentDiaCount === 2) {
    return potentialWinPosition
  }
  return null
}


function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}