<template>
  <div
    class="puzzle-piece"
    :style="pieceStyle"
    :class="{ 'is-selected': isSelected, 'is-dragging': isDragging }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @drop="onDrop"
    @dragover.prevent
    @dragenter.prevent
    @click="onClick"
  ></div>
</template>

<script>
export default {
  props: {
    piece: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      isDragging: false
    }
  },
  computed: {
    isSelected () {
      return this.$parent.selectedPiece && this.$parent.selectedPiece.id === this.piece.id
    },
    pieceStyle () {
      const gridSize = Math.sqrt(this.$parent.level.elements)

      const row = Math.floor(this.piece.correctPosition / gridSize)
      const col = this.piece.correctPosition % gridSize

      return {
        width: '100%',
        height: '100%',
        backgroundImage: `url(${this.piece.image})`,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${(col / (gridSize - 1)) * 100}% ${(row / (gridSize - 1)) * 100}%`
      }
    }
  },
  methods: {
    onClick () {
      this.$emit('piece-clicked', this.piece)
    },
    onDragStart (event) {
      this.isDragging = true

      event.dataTransfer.setData('application/json', JSON.stringify({
        pieceId: this.piece.id
      }))

      event.dataTransfer.effectAllowed = 'move'

      event.stopPropagation()

      this.$parent.startDrag(this.piece)
    },
    onDragEnd () {
      this.isDragging = false
    },
    onDrop (event) {
      event.preventDefault()
      event.stopPropagation()

      try {
        const data = JSON.parse(event.dataTransfer.getData('application/json'))
        const draggedPieceId = data.pieceId

        this.$parent.finishDrag(this.piece, draggedPieceId)
      } catch (error) {
        console.error('Error processing drop:', error)
      }
    }
  }
}
</script>

<style scoped>
.puzzle-piece {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 1px solid #ddd;
  cursor: grab;
  user-select: none;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.puzzle-piece:hover {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  transform: scale(0.98);
  z-index: 10;
}

.puzzle-piece.is-selected {
  border: 2px solid #42b983;
  box-shadow: 0 0 8px rgba(66, 185, 131, 0.5);
  transform: scale(0.95);
  z-index: 5;
}

.puzzle-piece.is-dragging {
  opacity: 0.7;
  border: 2px dashed #42b983;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  z-index: 20;
}

</style>
