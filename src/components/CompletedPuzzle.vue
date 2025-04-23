<template>
  <div class="completed-puzzle">
    <div class="completed-puzzle-container">
      <img :src="image" alt="Ukończona układanka" class="completed-image" />
    </div>
    <div class="completion-stats">
      <div class="congratulations-message">
        Gratulacje, udało Ci się ułożyć obrazek w czasie {{ formattedTime }}!
      </div>
      <div class="continue-message" aria-live="polite">
        Za <span class="countdown">{{ countdownSeconds }}</span> sekund pojawi się pytanie...
      </div>
      <button
        class="continue-button"
        @click="continueToQuestion"
        aria-label="Przejdź do pytania"
      >
        Kontynuuj
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompletedPuzzle',
  props: {
    image: {
      type: String,
      required: true
    },
    completionTime: {
      type: Number,
      required: true,
      validator: value => value >= 0
    },
    countdownDuration: {
      type: Number,
      default: 10,
      validator: value => value >= 0
    }
  },
  data () {
    return {
      countdownSeconds: this.countdownDuration,
      countdownTimer: null
    }
  },
  computed: {
    formattedTime () {
      const minutes = Math.floor(this.completionTime / 60)
      const seconds = this.completionTime % 60
      return `${minutes} min ${seconds.toString().padStart(2, '0')} sekund`
    }
  },
  mounted () {
    this.startCountdown()
  },
  beforeDestroy () {
    this.clearCountdown()
  },
  methods: {
    startCountdown () {
      if (this.countdownTimer) return
      this.countdownSeconds = this.countdownDuration
      this.countdownTimer = setInterval(() => {
        this.countdownSeconds -= 1
        if (this.countdownSeconds <= 0) {
          this.clearCountdown()
          this.continueToQuestion()
        }
      }, 1000)
    },
    clearCountdown () {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },
    continueToQuestion () {
      this.clearCountdown()
      this.$emit('continue')
    }
  }
}
</script>

<style scoped>
.completed-puzzle {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.completed-puzzle-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  animation: appear 0.5s ease-in-out;
}

.completed-image {
  display: block;
  width: 100%;
  height: auto;
}

.completion-stats {
  width: 100%;
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.congratulations-message {
  margin-bottom: 15px;
  font-size: 1.3em;
  font-weight: bold;
  color: #333;
}

.continue-message {
  margin: 15px 0;
  font-size: 1.1em;
  color: #666;
}

.countdown {
  font-weight: bold;
  color: #e67e22;
  font-size: 1.2em;
  animation: pulse 1s infinite;
}

.continue-button {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.continue-button:hover {
  background-color: #369f6e;
}

@keyframes appear {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

</style>
