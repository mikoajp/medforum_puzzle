<template>
  <div class="game-question">
    <h2>Pytanie przed poziomem {{ nextLevel }}</h2>
    <div class="question-text" v-html="question.question"></div>
    <div class="answers">
      <div
        v-for="answer in question.answers"
        :key="answer.id"
        class="answer"
        @click="selectAnswer(answer.id)"
        v-html="formatAnswer(answer)"
      >
      </div>
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
    },
    formatAnswer (answer) {
      // Jeśli odpowiedź już zawiera HTML, zwracamy ją bezpośrednio
      if (answer.text.includes('<')) {
        return answer.text
      }
      // W przeciwnym razie formatujemy odpowiedź w spójny sposób
      return `<b>${answer.id}.</b> ${answer.text}`
    }
  }
}
</script>

<style scoped>
.game-question {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.question-text {
  font-size: 1.2em;
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 5px;
  text-align: left;
}

.answers {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 20px;
}

.answer {
  padding: 15px;
  background: #42b983;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.answer:hover {
  background: #369f6e;
}

/* To jest trick aby style z v-html działały */
::v-deep div[style] {
  display: block;
}

::v-deep b {
  font-weight: bold;
}
</style>
