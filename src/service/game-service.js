export default class GameLogic {
  constructor (levelData) {
    this.level = levelData
    this.gridSize = Math.sqrt(levelData.elements)
    this.pieces = []
    this.startTime = null
    this.elapsedTime = 0
    this.timer = null
    this.isCompleted = false

    this.initPuzzle()
  }

  initPuzzle () {
    this.pieces = []
    for (let i = 0; i < this.level.elements; i++) {
      this.pieces.push({
        id: i,
        correctPosition: i,
        currentPosition: i,
        image: this.level.image,
        isDragging: false,
        isDragOver: false
      })
    }

    this.shufflePieces()
  }

  shufflePieces () {
    const positions = Array.from({ length: this.pieces.length }, (_, i) => i)

    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    this.pieces.forEach((piece, index) => {
      piece.currentPosition = positions[index]
    })

    if (this.checkCompletion()) {
      this.shufflePieces()
    }

    this.isCompleted = false
  }

  swapPieces (piece1, piece2) {
    const tempPosition = piece1.currentPosition
    piece1.currentPosition = piece2.currentPosition
    piece2.currentPosition = tempPosition

    if (this.checkCompletion()) {
      this.isCompleted = true
      return true
    }

    return false
  }

  checkCompletion () {
    return this.pieces.every(piece => piece.currentPosition === piece.correctPosition)
  }

  getPieceAt (position) {
    return this.pieces.find(p => p.currentPosition === position)
  }

  resetDragStates () {
    this.pieces.forEach(p => {
      p.isDragging = false
      p.isDragOver = false
    })
  }

  getPiecePosition (piece) {
    const row = Math.floor(piece.currentPosition / this.gridSize)
    const col = piece.currentPosition % this.gridSize

    return {
      row,
      col,
      top: (row * 100 / this.gridSize) + '%',
      left: (col * 100 / this.gridSize) + '%',
      width: (100 / this.gridSize) + '%',
      height: (100 / this.gridSize) + '%'
    }
  }

  getPieceBackground (piece) {
    const row = Math.floor(piece.correctPosition / this.gridSize)
    const col = piece.correctPosition % this.gridSize

    return {
      image: piece.image,
      backgroundSize: `${this.gridSize * 100}% ${this.gridSize * 100}%`,
      backgroundPosition: `${(col / (this.gridSize - 1)) * 100}% ${(row / (this.gridSize - 1)) * 100}%`
    }
  }

  startTimer () {
    this.startTime = Date.now()
    this.elapsedTime = 0
  }

  formatTime (seconds) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}
