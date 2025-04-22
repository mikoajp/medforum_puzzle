<template>
  <div class="ranking-puzzle">
    <h2>Gratulacje! Ukończyłeś wszystkie poziomy!</h2>
    <div class="user-score">
      <h3>Twój wynik:</h3>
      <ul>
        <li>Poprawne odpowiedzi: {{ correctAnswers }} / {{ totalQuestions }}</li>
        <li>Ukończone poziomy: {{ completedLevels.length }}</li>
        <li>Całkowity czas: {{ formatTime(totalTime) }}</li>
      </ul>
    </div>

    <div class="level-summary">
      <h3>Podsumowanie poziomów:</h3>
      <div v-for="level in completedLevels" :key="level.level" class="level-item">
        <strong>Poziom {{ level.level }}</strong>:
        Ukończony w czasie {{ formatTime(level.time) }}
      </div>
    </div>

    <button @click="playAgain" class="play-again-button">Zagraj ponownie</button>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapState('game', ['userProgress']),
    completedLevels () {
      return Object.keys(this.userProgress)
        .filter(key => key !== 'correctAnswers')
        .map(level => ({
          level: parseInt(level),
          ...this.userProgress[level]
        }))
        .sort((a, b) => a.level - b.level)
    },
    totalTime () {
      return this.completedLevels.reduce((total, level) => {
        return total + (level.time || 0)
      }, 0)
    },
    correctAnswers () {
      return this.userProgress.correctAnswers || 0
    },
    totalQuestions () {
      return this.completedLevels.length - 1
    }
  },
  methods: {
    ...mapMutations('game', ['SET_GAME_STARTED']),
    formatTime (seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    playAgain () {
      localStorage.removeItem('puzzleProgress')
      this.SET_GAME_STARTED(false)
    }
  }
}
</script>

<style scoped>
.ranking-puzzle {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  color: #42b983;
  margin-bottom: 20px;
}

.user-score {
  margin-bottom: 30px;
}

.user-score ul {
  list-style: none;
  padding: 0;
}

.user-score li {
  padding: 8px;
  background-color: #e9ecef;
  margin-bottom: 5px;
  border-radius: 4px;
}

.level-summary {
  margin-bottom: 30px;
}

.level-item {
  padding: 10px;
  margin-bottom: 5px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.play-again-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.play-again-button:hover {
  background-color: #369f6e;
}
</style>
