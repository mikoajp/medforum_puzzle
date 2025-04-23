<template>
  <div id="app">
    <CampaignStatus v-if="!gameStarted" />
    <div v-else>
      <FullImagePreview
        v-if="showFullImage"
        :image="currentLevel ? currentLevel.image : ''"
        :levelNumber="currentLevel ? currentLevel.level : 1"
        @start-puzzle="startPuzzle"
      />
      <CompletedPuzzle
        v-else-if="showCompletedPuzzle"
        :image="currentLevel ? currentLevel.image : ''"
        :completionTime="completionTime"
        :countdownDuration="10"
        @continue="continueAfterCompletion"
      />
      <GameQuestion
        v-else-if="showQuestion"
        :question="currentQuestion"
        :nextLevel="currentLevel ? currentLevel.level : 1"
        @answer-selected="handleAnswer"
      />
      <GameBoard
        v-else
        :level="currentLevel"
        @level-completed="handleLevelCompletion"
      />
    </div>
  </div>
</template>

<script>
import CampaignStatus from './components/CampaignStatus.vue'
import FullImagePreview from './components/FullImagePreview.vue'
import GameQuestion from './components/GameQuestion.vue'
import GameBoard from './components/GameBoard.vue'
import CompletedPuzzle from './components/CompletedPuzzle.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
    CampaignStatus,
    FullImagePreview,
    GameQuestion,
    GameBoard,
    CompletedPuzzle
  },
  computed: {
    ...mapState('game', [
      'gameStarted',
      'showFullImage',
      'showCompletedPuzzle',
      'showQuestion',
      'completionTime',
      'currentLevel',
      'currentQuestion'
    ])
  },
  created () {
    this.initGame()
  },
  methods: {
    ...mapActions('game', [
      'initGame',
      'handleAnswer',
      'startPuzzle',
      'handleLevelCompletion',
      'continueAfterCompletion'
    ])
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

</style>
