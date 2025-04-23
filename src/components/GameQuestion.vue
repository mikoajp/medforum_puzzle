<template>
  <div class="game-question">
    <!-- Wyświetlamy pytanie z opcjami odpowiedzi -->
    <div class="question-content" v-html="question.question"></div>

    <!-- Przyciski do wyboru odpowiedzi -->
    <div class="answer-buttons">
      <button
        v-for="letter in ['A', 'B', 'C']"
        :key="letter"
        class="answer-button"
        @click="selectAnswer(letter)"
      >
        {{ letter }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    question: {
      type: Object,
      required: true
    },
    nextLevel: {
      type: Number,
      required: true
    }
  },
  methods: {
    selectAnswer (answerId) {
      this.$emit('answer-selected', answerId)
    }
  }
}
</script>

<style scoped>
.game-question {
  max-width: 500px;
  margin: 0 auto;
  padding: 15px 15px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

.question-content {
  margin-bottom: 20px;
  text-align: left;
}

.answer-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  max-width: 300px;
  margin: 0 auto;
}

.answer-button {
  width: 60px;
  height: 40px;
  background-color: #4CAF50; /* Zielony kolor jak na obrazku */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.answer-button:hover {
  background-color: #45a049;
}

/* Ważne: Te style pozwalają na działanie stylów inline w v-html */
::v-deep div[style] {
  display: block;
}

::v-deep b {
  font-weight: bold;
}

</style>
