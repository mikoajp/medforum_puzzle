export default class DragService {
  constructor () {
    this.draggedPiece = null
    this.hoverPiece = null
    this.isDragging = false
    this.dragVisual = {
      active: false,
      style: {}
    }
    this.dragOffset = {
      x: 0,
      y: 0
    }
    this.containerRect = null
  }

  startDrag (event, piece, containerElement, gameLogic) {
    this.containerRect = containerElement.getBoundingClientRect()

    const pieceElement = event.target
    const pieceRect = pieceElement.getBoundingClientRect()
    this.dragOffset.x = event.clientX - pieceRect.left
    this.dragOffset.y = event.clientY - pieceRect.top

    this.isDragging = true
    piece.isDragging = true
    this.draggedPiece = piece

    const background = gameLogic.getPieceBackground(piece)
    const position = gameLogic.getPiecePosition(piece)

    this.dragVisual.active = true
    this.dragVisual.style = {
      backgroundImage: `url(${background.image})`,
      backgroundSize: background.backgroundSize,
      backgroundPosition: background.backgroundPosition,
      width: position.width,
      height: position.height,
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 200,
      opacity: 0.9,
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
      left: (event.clientX - this.containerRect.left - this.dragOffset.x) + 'px',
      top: (event.clientY - this.containerRect.top - this.dragOffset.y) + 'px'
    }

    event.preventDefault()

    return {
      draggedPiece: piece,
      dragVisual: this.dragVisual
    }
  }

  handleDragMove (event, gameLogic) {
    if (!this.isDragging || !this.dragVisual.active || !this.containerRect) {
      return null
    }

    this.dragVisual.style.left = (event.clientX - this.containerRect.left - this.dragOffset.x) + 'px'
    this.dragVisual.style.top = (event.clientY - this.containerRect.top - this.dragOffset.y) + 'px'

    return this.findPieceUnderMouse(event, gameLogic)
  }

  findPieceUnderMouse (event, gameLogic) {
    const x = event.clientX - this.containerRect.left
    const y = event.clientY - this.containerRect.top

    const pieceWidth = this.containerRect.width / gameLogic.gridSize
    const pieceHeight = this.containerRect.height / gameLogic.gridSize

    const col = Math.floor(x / pieceWidth)
    const row = Math.floor(y / pieceHeight)

    if (col >= 0 && col < gameLogic.gridSize && row >= 0 && row < gameLogic.gridSize) {
      const position = row * gameLogic.gridSize + col
      const pieceAtPosition = gameLogic.getPieceAt(position)

      if (pieceAtPosition && this.draggedPiece && pieceAtPosition.id !== this.draggedPiece.id) {
        gameLogic.pieces.forEach(p => {
          if (p.id !== pieceAtPosition.id) {
            p.isDragOver = false
          }
        })

        pieceAtPosition.isDragOver = true
        this.hoverPiece = pieceAtPosition

        return {
          hoverPiece: pieceAtPosition,
          dragVisual: this.dragVisual
        }
      }
    }

    return null
  }

  handleDragLeave (gameLogic) {
    if (this.isDragging) {
      gameLogic.pieces.forEach(p => {
        p.isDragOver = false
      })
      this.hoverPiece = null
    }
  }

  dropPiece (targetPiece, gameLogic) {
    if (this.isDragging && this.draggedPiece) {
      if (this.hoverPiece && this.draggedPiece.id !== this.hoverPiece.id) {
        const completed = gameLogic.swapPieces(this.draggedPiece, this.hoverPiece)
        this.endDrag(gameLogic)
        return completed
      }
      this.endDrag(gameLogic)
    }
    return false
  }

  endDrag (gameLogic) {
    if (this.isDragging) {
      this.isDragging = false

      if (this.draggedPiece) {
        this.draggedPiece.isDragging = false
        this.draggedPiece = null
      }

      gameLogic.resetDragStates()
      this.hoverPiece = null
      this.dragVisual.active = false

      return true
    }
    return false
  }

  getDragVisual () {
    return this.dragVisual
  }

  getHoverPiece () {
    return this.hoverPiece
  }

  isCurrentlyDragging () {
    return this.isDragging
  }
}
