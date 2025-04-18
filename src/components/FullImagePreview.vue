<template>
  <div class="full-image-preview">
    <h2>Poziom {{ levelNumber }}</h2>
    <p>Zapamiętaj obrazek. Puzzle zaczną się za {{ countdown }} sekund...</p>
    <img :src="image" alt="Pełny obrazek poziomu" class="preview-image" />
    <button @click="startPuzzle" class="start-now-button">Rozpocznij teraz</button>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    image: {
      type: String,
      required: true
    },
    levelNumber: {
      type: Number,
      default () {
        return this.currentLevel ? this.currentLevel.level : 1
      }
    }
  },
  data () {
    return {
      countdown: 3,
      interval: null
    }
  },
  computed: {
    ...mapState('game', ['currentLevel'])
  },
  mounted () {
    this.interval = setInterval(() => {
      this.countdown -= 1
      if (this.countdown <= 0) {
        this.$emit('start-puzzle')
        clearInterval(this.interval)
      }
    }, 1000)
  },
  beforeDestroy () {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    startPuzzle () {
      this.$emit('start-puzzle')
      clearInterval(this.interval)
    }
  }
}
</script>

<style scoped>
.full-image-preview {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  margin: 20px 0;
}

.start-now-button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.start-now-button:hover {
  background: #369f6e;
}
</style>
