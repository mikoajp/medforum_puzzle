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
          :class="{ 'selected': selectedPiece && selectedPiece.id === piece.id }"
          :style="getPieceBackground(piece)"
          draggable="true"
          @dragstart="dragStart($event, piece)"
          @dragover.prevent
          @drop="drop($event, piece)"
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
      timer: null
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
      // Calculate grid size based on elements
      this.gridSize = Math.sqrt(this.level.elements)

      // Create the pieces
      this.pieces = []
      for (let i = 0; i < this.level.elements; i++) {
        this.pieces.push({
          id: i,
          correctPosition: i,
          currentPosition: i,
          image: this.level.image
        })
      }

      // Shuffle the pieces
      this.shufflePieces()

      console.log('Puzzle initialized with', this.pieces.length, 'pieces')
    },

    shufflePieces () {
      // Create an array of positions
      const positions = Array.from({ length: this.pieces.length }, (_, i) => i)

      // Shuffle the positions using Fisher-Yates
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]]
      }

      // Assign the shuffled positions to pieces
      this.pieces.forEach((piece, index) => {
        piece.currentPosition = positions[index]
      })

      // Make sure the puzzle isn't accidentally solved
      if (this.checkCompletion()) {
        console.log('Puzzle was already solved after shuffle, reshuffling...')
        this.shufflePieces()
      } else {
        console.log('Pieces shuffled successfully')
      }

      // Reset move counter
      this.moveCount = 0
    },

    reShufflePieces () {
      this.shufflePieces()
      this.selectedPiece = null

      // Reset timer
      this.stopTimer()
      this.startTimer()
    },

    getPiecePosition (piece) {
      // Calculate row and column based on current position
      const row = Math.floor(piece.currentPosition / this.gridSize)
      const col = piece.currentPosition % this.gridSize

      // Calculate percentage positions
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
      // Calculate which part of the image to show based on correct position
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
        // First piece selected
        this.selectedPiece = piece
        console.log('Selected piece', piece.id)
      } else if (this.selectedPiece.id === piece.id) {
        // Clicked the same piece twice, deselect it
        this.selectedPiece = null
        console.log('Deselected piece')
      } else {
        // Second piece selected, swap them
        this.swapPieces(this.selectedPiece, piece)
        this.selectedPiece = null
      }
    },

    dragStart (event, piece) {
      // Set the piece ID as the drag data
      event.dataTransfer.setData('text/plain', piece.id)

      // For better UI feedback during drag
      setTimeout(() => {
        piece.isDragging = true
        this.selectedPiece = piece
      }, 0)

      console.log('Started dragging piece', piece.id)
    },

    drop (event, targetPiece) {
      const draggedPieceId = parseInt(event.dataTransfer.getData('text/plain'))
      const draggedPiece = this.pieces.find(p => p.id === draggedPieceId)

      if (draggedPiece && draggedPiece.id !== targetPiece.id) {
        // Swap the pieces
        this.swapPieces(draggedPiece, targetPiece)
      }

      // Reset dragging state
      this.pieces.forEach(p => {
        p.isDragging = false
      })

      this.selectedPiece = null
      console.log('Dropped piece', draggedPieceId, 'onto', targetPiece.id)
    },

    swapPieces (piece1, piece2) {
      // Swap the current positions
      const tempPosition = piece1.currentPosition
      piece1.currentPosition = piece2.currentPosition
      piece2.currentPosition = tempPosition

      // Increment move counter
      this.moveCount++

      console.log(`Swapped piece ${piece1.id} with ${piece2.id}`)

      // Check if puzzle is completed
      if (this.checkCompletion()) {
        this.handleCompletion()
      }
    },

    checkCompletion () {
      return this.pieces.every(piece => piece.currentPosition === piece.correctPosition)
    },

    handleCompletion () {
      console.log('Puzzle completed!')
      this.stopTimer()

      // Emit completion event to parent with stats
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
  /* Make the container square regardless of screen size */
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
  box-shadow: 0 0 8px rgba(66, 185, 131, 0.5);
  z-index: 5;
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
