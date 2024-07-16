const rows = 3
const cols = 3
const boxes = []
const queueOfZeroes = []
const queueOfCrosses = []
let vsBot = localStorage.getItem('vsBot') ? JSON.parse(localStorage.getItem('vsBot')) : true
console.log(vsBot, JSON.parse(localStorage.getItem('vsBot')))
document.querySelector('.is-bot').innerText = (vsBot ? 'Vs Bot 🤖' : 'Vs Human 🧔')
const player = 0
const bot = 1
let botThinking = false
const botExpressions = {
  'THINKING': ['😗','🤔','🤨','😏','😮','🧐'],
  'THINKINGWORDS': ['Hmm, let me think...','Calculating the best move...',"Let's see... where should I go next?",'Considering my options...','This requires some strategic thinking...','Analyzing the board...','Evaluating possibilities...',"This one's making me think!"],
  'HAPPY': ['😀','😁','😄','😉','😋','😎','😍','😚','🤩','😏','😜','🤪'],
  'HAPPYWORDS': ["I'm feeling pretty good about that!", "Awesome, things are going my way!", "Woohoo! I did it!","Nice! Everything's coming together!","I'm really enjoying this game!","That was a smart move, if I do say so myself!","Yay! I made a good choice!"],
  'SAD': ['😣','😥','🤐','😫','😕','😓','🙁','😞','😬','😦','😱','🥶','🥺'],
  'SADWORDS':["Oh no, I didn't see that coming...","Well, that didn't go as planned...",'Oops, I made a mistake.','Ah, you got me this time!',"I'm feeling a bit down after that move.","Looks like I'm not at my best today.","I'm a bit sad about that outcome."],
  'WAITING': ['😗','🤨','🥱','😴','🧐'],
  'WAITINGWORDS':["Your turn! Take your time.","Waiting for your move...","What will you do next?", "Thinking hard, huh? Take your time!","Your move! Let's see what you've got.","Take your time, I'm patiently waiting.","Excited to see your strategy!"]
}
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

const botExpressionsEle = document.querySelector('.bot-expressions')

document.querySelectorAll('.restart-btn').forEach(btn => btn.addEventListener('click', function() {
  location.reload()
}))

document.querySelector('.is-bot').addEventListener('click', function() {
  if(queueOfCrosses.length > 0 || queueOfZeroes.length > 0) {
    return
  }
  document.querySelector('.is-bot').innerText = (vsBot ? 'Vs Human 🧔' : 'Vs Bot 🤖')
  vsBot = !vsBot
  localStorage.setItem('vsBot', vsBot)
})

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
    document.querySelector('.is-bot').disabled = true
    if(gameOver || botThinking) return
    if(boxes[row] && boxes[row][col] && boxes[row][col].marked) return
    const value = currentPlayer
    markTheTerritory(boxEle, row, col)
    if(value === 1) {
      handleCross(boxEle, row, col)
    }else {
      handleZero(boxEle, row, col)
    }
    Promise.resolve().then(() => {
      if(vsBot && value === 0 && !gameOver) {
        const beShort = queueOfCrosses.length + queueOfZeroes.length < 4
        const randomDelay = beShort ? 2 : 2 + getRandomNumber(4)
        botThinking = true
        const expression = botExpressions.THINKING[getRandomNumber(botExpressions.THINKING.length)]
        const words = botExpressions.THINKINGWORDS[getRandomNumber(botExpressions.THINKINGWORDS.length)]
        botExpressionsEle.innerText = expression + ' ' + words
        const interval = setInterval(() => {
          let randomBox = boxes[getRandomNumber(3)][getRandomNumber(3)]
          while(randomBox.marked) {
            randomBox = boxes[getRandomNumber(3)][getRandomNumber(3)]
          }
          randomBox.element.classList.add('cross-hover')
          setTimeout(() => {
            randomBox.element.classList.remove('cross-hover')
          }, 250);
        }, 300)
        setTimeout(() => {
          Promise.resolve().then(() => {
            clearInterval(interval)
            runBot()
            botThinking = false
            const expression = botExpressions.WAITING[getRandomNumber(botExpressions.WAITING.length)]
            const words = botExpressions.WAITINGWORDS[getRandomNumber(botExpressions.WAITINGWORDS.length)]
            botExpressionsEle.innerText = expression + ' ' + words
          })
        }, randomDelay * 1000);
      } 
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
      let randomRow = getRandomNumber(3)
      let randomCol = getRandomNumber(3)
    
      while(boxes[randomRow][randomCol].marked) {
        randomRow = getRandomNumber(3)
        randomCol = getRandomNumber(3)
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
    boxes[elementToRemove.row][elementToRemove.col] = {element: elementToRemove.element, marked: false, value: null}
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
    boxes[elementToRemove.row][elementToRemove.col] = {element: elementToRemove.element, marked: false, value: null}
  }

  Promise.resolve().then(() => {
    // Promised in order to run this only after the previous code is done running
    checkIfWon()
  })
}


function getRandomNumber(max) {
  return Math.floor(Math.random() * max)
}

function checkIfWon() {
  const isWon = checkRows() || checkCols() || checkDiagonals()
  if(!isWon) return
  gameOver = true
  document.querySelector('.game-over-overlay').classList.add('show')
  if(currentPlayer === 1 && vsBot) {
    document.querySelector('.who-won').innerText = 'You Won!'
    const expression = botExpressions.SAD[getRandomNumber(botExpressions.SAD.length)]
    const words = botExpressions.SADWORDS[getRandomNumber(botExpressions.SADWORDS.length)]
    botExpressionsEle.innerText = expression + ' ' + words
  }else if(vsBot){
    document.querySelector('.who-won').innerText = 'Bot Won!'
    const expression = botExpressions.HAPPY[getRandomNumber(botExpressions.HAPPY.length)]
    const words = botExpressions.HAPPYWORDS[getRandomNumber(botExpressions.HAPPYWORDS.length)]
    botExpressionsEle.innerText = expression + ' ' + words
  }else {
    document.querySelector('.who-won').innerText = currentPlayer === 1 ? 'Player 1 Won!': 'Player 2 Won!'
  }
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