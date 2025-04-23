<template>
  <div class="end-game">
    <div class="end-game-container">
      <h1 class="end-game-title">Koniec gry</h1>

      <div class="game-summary">
        <div class="summary-item">
          <span class="summary-label">Twój wynik:</span>
          <span class="summary-value">{{ completedLevels }} / {{ totalLevels }}</span>
        </div>

        <div class="summary-item">
          <span class="summary-label">Całkowity czas:</span>
          <span class="summary-value">{{ formattedTotalTime }}</span>
        </div>
      </div>

      <button class="restart-button" @click="restartGame">
        Zagraj ponownie
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EndGame',
  props: {
    userProgress: {
      type: Object,
      required: true
    },
    totalLevels: {
      type: Number,
      required: true
    }
  },
  computed: {
    completedLevels () {
      return Object.keys(this.userProgress)
        .filter(key => !isNaN(parseInt(key)))
        .filter(level => this.userProgress[level] && this.userProgress[level].completed)
        .length
    },
    totalTime () {
      let totalSeconds = 0

      Object.keys(this.userProgress)
        .filter(key => !isNaN(parseInt(key)))
        .forEach(level => {
          if (this.userProgress[level] && this.userProgress[level].completed) {
            totalSeconds += this.userProgress[level].time || 0
          }
        })

      return totalSeconds
    },
    formattedTotalTime () {
      const minutes = Math.floor(this.totalTime / 60)
      const seconds = this.totalTime % 60
      return `${minutes} min ${seconds.toString().padStart(2, '0')} sekund`
    }
  },
  methods: {
    restartGame () {
      this.$emit('restart-game')
    }
  }
}
</script>

<style scoped>
.end-game {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
}

.end-game-container {
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.end-game-title {
  color: #d32f2f;
  font-size: 2.5em;
  margin-bottom: 30px;
}

.game-summary {
  margin: 30px 0;
}

.summary-item {
  margin-bottom: 20px;
  font-size: 1.3em;
}

.summary-label {
  font-weight: normal;
  color: #555;
  margin-right: 10px;
}

.summary-value {
  font-weight: bold;
  font-size: 1.2em;
  color: #333;
}

.restart-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px 25px;
  font-size: 1.2em;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;
}

.restart-button:hover {
  background-color: #45a049;
}

</style>
