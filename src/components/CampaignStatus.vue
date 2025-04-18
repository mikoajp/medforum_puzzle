<template>
  <div class="campaign-status">
    <div v-if="loading" class="loading">Ładowanie...</div>
    <div v-else-if="campaignNotStarted" class="message">
      Puzzle będą dostępne od {{ campaign.date_start }}
    </div>
    <div v-else-if="campaignEnded" class="message">
      Puzzle zakończyły się {{ campaign.date_end }}
    </div>
    <button v-else @click="startGame" class="start-button">Rozpocznij grę</button>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState({
      loading: state => state.game.loading,
      campaign: state => state.game.campaign
    }),
    ...mapGetters('game', [
      'campaignNotStarted',
      'campaignEnded'
    ])
  },
  methods: {
    ...mapActions('game', ['startNewGame']),
    startGame () {
      this.startNewGame()
    }
  }
}
</script>

<style scoped>
.campaign-status {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.loading, .message {
  font-size: 1.2em;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 5px;
}

.start-button {
  padding: 10px 20px;
  font-size: 1.2em;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.start-button:hover {
  background: #369f6e;
}
</style>
