<template>
  <div class="game-board">
    <h2>Poziom {{ level.level }}</h2>

    <div class="game-info">
      <div class="timer">Czas: {{ formattedTime }}</div>
    </div>

    <div
      class="puzzle-container"
      ref="puzzleContainer"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <div
        v-for="piece in gameLogic.pieces"
        :key="piece.id"
        class="piece-wrapper"
        :style="getPiecePositionStyle(piece)"
      >
        <div
          class="puzzle-piece"
          :class="{
            'selected': selectionService.getSelectedPiece() && selectionService.getSelectedPiece().id === piece.id,
            'dragging': piece.isDragging,
            'drag-over': piece.isDragOver,
            'hover-effect': dragService.getHoverPiece() && dragService.getHoverPiece().id === piece.id
          }"
          :style="getPieceBackgroundStyle(piece)"
          @mousedown="startDrag($event, piece)"
          @mouseup="dropPiece(piece)"
          @click="clickPiece(piece)"
        ></div>
      </div>

      <div
        v-if="dragService.getDragVisual().active"
        class="drag-visual"
        :style="dragService.getDragVisual().style"
      ></div>
    </div>

  </div>
</template>

<script>
import GameLogic from '@/service/game-service'
import DragService from '@/service/drag-service'
import SelectionService from '@/service/selection-service'
import TimerService from '@/service/timer-service'

export default {
  props: {
    level: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      gameLogic: null,
      dragService: null,
      selectionService: null,
      timerService: null,
      formattedTime: '0:00'
    }
  },
  created () {
    this.gameLogic = new GameLogic(this.level)
    this.dragService = new DragService()
    this.selectionService = new SelectionService()
    this.timerService = new TimerService()
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
    getPiecePositionStyle (piece) {
      const position = this.gameLogic.getPiecePosition(piece)

      return {
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height
      }
    },

    getPieceBackgroundStyle (piece) {
      const background = this.gameLogic.getPieceBackground(piece)

      return {
        backgroundImage: `url(${background.image})`,
        backgroundSize: background.backgroundSize,
        backgroundPosition: background.backgroundPosition
      }
    },

    clickPiece (piece) {
      const result = this.selectionService.handlePieceSelection(piece, this.gameLogic)

      if (result.completed) {
        this.handleCompletion()
      }
    },

    startDrag (event, piece) {
      const result = this.dragService.startDrag(
        event,
        piece,
        this.$refs.puzzleContainer,
        this.gameLogic
      )

      if (result) {
        this.selectionService.setSelectedPiece(piece)
      }
    },

    handleMouseMove (event) {
      const result = this.dragService.handleDragMove(event, this.gameLogic)

      if (result) {
        this.$forceUpdate()
      }
    },

    handleMouseLeave () {
      this.dragService.handleDragLeave(this.gameLogic)
      this.$forceUpdate()
    },

    dropPiece (targetPiece) {
      const completed = this.dragService.dropPiece(targetPiece, this.gameLogic)

      if (completed) {
        this.handleCompletion()
      }

      this.selectionService.clearSelection()
      this.$forceUpdate()
    },

    endDrag () {
      if (this.dragService.isCurrentlyDragging()) {
        this.dragService.endDrag(this.gameLogic)
        this.selectionService.clearSelection()
        this.$forceUpdate()
      }
    },

    handleCompletion () {
      this.timerService.stopTimer()
      const elapsedTime = this.timerService.getElapsedTime()

      this.$emit('level-completed', {
        ...this.level,
        stats: {
          time: elapsedTime
        }
      })
    },

    startTimer () {
      this.timerService.startTimer(this.updateFormattedTime)
    },

    updateFormattedTime (time) {
      this.formattedTime = this.timerService.formatTime(time)
    },

    stopTimer () {
      this.timerService.stopTimer()
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

</style>
