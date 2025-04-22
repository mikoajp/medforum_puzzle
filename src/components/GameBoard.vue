<template>
  <div class="game-board">
    <h2>Poziom {{ level.level }}</h2>

    <div class="game-info">
      <div class="moves-counter">Ruchy: {{ moveCount }}</div>
      <div class="timer">Czas: {{ formatTime(elapsedTime) }}</div>
    </div>

    <div
      class="puzzle-container"
      ref="puzzleContainer"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <div
        v-for="piece in pieces"
        :key="piece.id"
        class="piece-wrapper"
        :style="getPiecePosition(piece)"
      >
        <div
          class="puzzle-piece"
          :class="{
            'selected': selectedPiece && selectedPiece.id === piece.id,
            'dragging': piece.isDragging,
            'drag-over': piece.isDragOver,
            'hover-effect': hoverPiece && hoverPiece.id === piece.id
          }"
          :style="getPieceBackground(piece)"
          @mousedown="startDrag($event, piece)"
          @mouseup="dropPiece(piece)"
          @click="clickPiece(piece)"
        ></div>
      </div>

      <div
        v-if="dragVisual.active"
        class="drag-visual"
        :style="dragVisual.style"
      ></div>
    </div>

    <button @click="reShufflePieces" class="shuffle-button">Przetasuj ponownie</button>
  </div>
</template>

<script>
export default {
  props: {
    level: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      pieces: [],
      selectedPiece: null,
      gridSize: 3,
      moveCount: 0,
      startTime: Date.now(),
      elapsedTime: 0,
      timer: null,
      draggedPiece: null,
      hoverPiece: null,
      isDragging: false,
      dragVisual: {
        active: false,
        style: {}
      },
      mousePosition: {
        x: 0,
        y: 0
      },
      dragOffset: {
        x: 0,
        y: 0
      },
      containerRect: null
    }
  },
  created () {
    this.initPuzzle()
  },
  mounted () {
    this.startTimer()
    window.addEventListener('mouseup', this.endDrag)
  },
  beforeDestroy () {
    this.stopTimer()
    window.removeEventListener('mouseup', this.endDrag)
  },
  methods: {
    initPuzzle () {
      this.gridSize = Math.sqrt(this.level.elements)

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
    },

    shufflePieces () {
      const positions = Array.from({ length: this.pieces.length }, (_, i) => i)

      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]]
      }

      this.pieces.forEach((piece, index) => {
        piece.currentPosition = positions[index]
      })

      if (this.checkCompletion()) {
        this.shufflePieces()
      }

      this.moveCount = 0
    },

    reShufflePieces () {
      this.shufflePieces()
      this.selectedPiece = null

      this.stopTimer()
      this.startTimer()
    },

    getPiecePosition (piece) {
      const row = Math.floor(piece.currentPosition / this.gridSize)
      const col = piece.currentPosition % this.gridSize

      const top = (row * 100 / this.gridSize) + '%'
      const left = (col * 100 / this.gridSize) + '%'
      const width = (100 / this.gridSize) + '%'
      const height = (100 / this.gridSize) + '%'

      return {
        position: 'absolute',
        top,
        left,
        width,
        height
      }
    },

    getPieceBackground (piece) {
      const row = Math.floor(piece.correctPosition / this.gridSize)
      const col = piece.correctPosition % this.gridSize

      return {
        backgroundImage: `url(${piece.image})`,
        backgroundSize: `${this.gridSize * 100}% ${this.gridSize * 100}%`,
        backgroundPosition: `${(col / (this.gridSize - 1)) * 100}% ${(row / (this.gridSize - 1)) * 100}%`
      }
    },

    clickPiece (piece) {
      if (!this.selectedPiece) {
        this.selectedPiece = piece
      } else if (this.selectedPiece.id === piece.id) {
        this.selectedPiece = null
      } else {
        this.swapPieces(this.selectedPiece, piece)
        this.selectedPiece = null
      }
    },

    startDrag (event, piece) {
      this.containerRect = this.$refs.puzzleContainer.getBoundingClientRect()

      const pieceElement = event.target
      const pieceRect = pieceElement.getBoundingClientRect()

      this.dragOffset.x = event.clientX - pieceRect.left
      this.dragOffset.y = event.clientY - pieceRect.top

      this.isDragging = true
      piece.isDragging = true
      this.draggedPiece = piece
      this.selectedPiece = piece

      this.dragVisual.active = true
      this.dragVisual.style = {
        ...this.getPieceBackground(piece),
        width: (100 / this.gridSize) + '%',
        height: (100 / this.gridSize) + '%',
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 200,
        opacity: 0.9,
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
        left: (event.clientX - this.containerRect.left - this.dragOffset.x) + 'px',
        top: (event.clientY - this.containerRect.top - this.dragOffset.y) + 'px'
      }

      event.preventDefault()
    },

    handleMouseMove (event) {
      if (this.isDragging && this.dragVisual.active && this.containerRect) {
        this.dragVisual.style.left = (event.clientX - this.containerRect.left - this.dragOffset.x) + 'px'
        this.dragVisual.style.top = (event.clientY - this.containerRect.top - this.dragOffset.y) + 'px'

        this.findPieceUnderMouse(event)
      }
    },

    findPieceUnderMouse (event) {
      const x = event.clientX - this.containerRect.left
      const y = event.clientY - this.containerRect.top

      const pieceWidth = this.containerRect.width / this.gridSize
      const pieceHeight = this.containerRect.height / this.gridSize

      const col = Math.floor(x / pieceWidth)
      const row = Math.floor(y / pieceHeight)

      if (col >= 0 && col < this.gridSize && row >= 0 && row < this.gridSize) {
        const position = row * this.gridSize + col
        const pieceAtPosition = this.pieces.find(p => p.currentPosition === position)

        if (pieceAtPosition && this.draggedPiece && pieceAtPosition.id !== this.draggedPiece.id) {
          this.pieces.forEach(p => {
            if (p.id !== pieceAtPosition.id) {
              p.isDragOver = false
            }
          })

          pieceAtPosition.isDragOver = true
          this.hoverPiece = pieceAtPosition
        }
      }
    },

    handleMouseLeave () {
      if (this.isDragging) {
        this.pieces.forEach(p => {
          p.isDragOver = false
        })
        this.hoverPiece = null
      }
    },

    dropPiece (targetPiece) {
      if (this.isDragging && this.draggedPiece) {
        if (this.hoverPiece && this.draggedPiece.id !== this.hoverPiece.id) {
          this.swapPieces(this.draggedPiece, this.hoverPiece)
        }
        this.endDrag()
      }
    },

    endDrag () {
      if (this.isDragging) {
        this.isDragging = false

        if (this.draggedPiece) {
          this.draggedPiece.isDragging = false
          this.draggedPiece = null
        }

        this.pieces.forEach(p => {
          p.isDragOver = false
        })

        this.hoverPiece = null
        this.selectedPiece = null

        this.dragVisual.active = false
      }
    },

    swapPieces (piece1, piece2) {
      const tempPosition = piece1.currentPosition
      piece1.currentPosition = piece2.currentPosition
      piece2.currentPosition = tempPosition

      this.moveCount++

      if (this.checkCompletion()) {
        this.handleCompletion()
      }
    },

    checkCompletion () {
      return this.pieces.every(piece => piece.currentPosition === piece.correctPosition)
    },

    handleCompletion () {
      this.stopTimer()

      this.$emit('level-completed', {
        ...this.level,
        stats: {
          moves: this.moveCount,
          time: this.elapsedTime
        }
      })
    },

    startTimer () {
      this.startTime = Date.now()
      this.elapsedTime = 0
      this.timer = setInterval(() => {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000)
      }, 1000)
    },

    stopTimer () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    formatTime (seconds) {
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.game-board {
  text-align: center;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.moves-counter, .timer {
  font-weight: bold;
  font-size: 1.1em;
  color: #42b983;
}

.puzzle-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 20px;
  border: 2px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
  aspect-ratio: 1/1;
}

.piece-wrapper {
  position: absolute;
  box-sizing: border-box;
  padding: 1px;
  transition: all 0.2s ease;
}

.puzzle-piece {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  cursor: grab;
  border: 1px solid #ddd;
  box-sizing: border-box;
  transition: transform 0.2s, box-shadow 0.2s;
}

.puzzle-piece:hover {
  transform: scale(0.98);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.puzzle-piece.selected {
  border: 2px solid #42b983;
  transform: scale(0.95);
  z-index: 5;
}

.puzzle-piece.dragging {
  opacity: 0.3;
  z-index: 50;
}

.puzzle-piece.drag-over {
  border: 3px solid #42b983;
  opacity: 1;
  z-index: 20;
  box-shadow: 0 0 12px rgba(66, 185, 131, 0.8);
  transform: scale(0.96);
  transition: all 0.15s ease;
}

.puzzle-piece.hover-effect {
  border: 2px dashed #42b983;
  opacity: 0.9;
}

.drag-visual {
  border: 2px solid #42b983;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(66, 185, 131, 0.7);
  cursor: grabbing;
  transition: transform 0.1s ease;
}

.shuffle-button {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.shuffle-button:hover {
  background-color: #369f6e;
}

</style>
