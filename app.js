const rows = 3
const cols = 3
const boxes = []
const queueOfZeroes = []
const queueOfCrosses = []
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
    boxEle.classList.remove('cross-hover', 'circle-hover')
    boxEle.classList.add(currentPlayer === 1 ? 'cross' : 'circle')
    boxEle.setAttribute('data-value', '2️⃣')
    let marked = true
    let value = currentPlayer
    currentPlayer = currentPlayer === 1 ? 0 : 1
    boxes[row][col] = {element: boxEle, marked, value}
    if(value === 1) {
      queueOfCrosses.forEach((el, idx) => {
        const currentValue = el.remaining
        if(currentValue == 1){ 
          el.element.classList.add('vanishing')
          console.log(currentValue)

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
    }else {
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
    }
    if(won()) {
      gameOver = true
      const grid = document.querySelector('.grid-container')
      grid.classList.add('mark', `${winPosition}`)
      console.log('WON!')
    }
  })
}


function won() {
  return checkRows() || checkCols() || checkDiagonals()
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
