<template>
  <div class="game-board">
    <h2>Poziom {{ level.level }}</h2>

    <div class="game-info">
      <div class="moves-counter">Ruchy: {{ moveCount }}</div>
      <div class="timer">Czas: {{ formatTime(elapsedTime) }}</div>
    </div>

    <div class="puzzle-container">
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
            'drag-over': piece.isDragOver
          }"
          :style="getPieceBackground(piece)"
          draggable="true"
          @dragstart="dragStart($event, piece)"
          @dragover.prevent="dragOver($event, piece)"
          @dragleave="dragLeave($event, piece)"
          @drop="drop($event, piece)"
          @dragend="dragEnd"
          @click="clickPiece(piece)"
        ></div>
      </div>
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
      draggedPiece: null
    }
  },
  created () {
    this.initPuzzle()
  },
  mounted () {
    this.startTimer()
  },
  beforeDestroy () {
    this.stopTimer()
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

    dragStart (event, piece) {
      event.dataTransfer.setData('text/plain', piece.id)

      setTimeout(() => {
        piece.isDragging = true
        this.draggedPiece = piece
        this.selectedPiece = piece
      }, 0)
    },

    dragOver (event, piece) {
      if (this.draggedPiece && this.draggedPiece.id !== piece.id) {
        piece.isDragOver = true
      }
    },

    dragLeave (event, piece) {
      piece.isDragOver = false
    },

    drop (event, targetPiece) {
      const draggedPieceId = parseInt(event.dataTransfer.getData('text/plain'))
      const draggedPiece = this.pieces.find(p => p.id === draggedPieceId)

      if (draggedPiece && draggedPiece.id !== targetPiece.id) {
        this.swapPieces(draggedPiece, targetPiece)
      }

      this.dragEnd()
    },

    dragEnd () {
      this.pieces.forEach(p => {
        p.isDragging = false
        p.isDragOver = false
      })
      this.draggedPiece = null
      this.selectedPiece = null
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
  opacity: 0.7;
  transform: scale(0.95);
  z-index: 100;
}

.puzzle-piece.drag-over {
  border: 2px solid #42b983;
  opacity: 1;
  z-index: 20;
  box-shadow: 0 0 10px rgba(66, 185, 131, 0.7);
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
