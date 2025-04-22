import apiService from '../../service/api-service'

const state = {
  campaign: null,
  loading: true,
  gameStarted: false,
  showFullImage: false,
  showQuestion: false,
  currentLevel: null,
  currentQuestion: null,
  userProgress: {},
  questions: [],
  previewTime: 3000 // 3 seconds preview
}

const mutations = {
  SET_CAMPAIGN (state, campaign) {
    state.campaign = campaign
  },
  SET_LOADING (state, loading) {
    state.loading = loading
  },
  SET_GAME_STARTED (state, started) {
    state.gameStarted = started
  },
  SET_SHOW_FULL_IMAGE (state, show) {
    state.showFullImage = show
  },
  SET_SHOW_QUESTION (state, show) {
    state.showQuestion = show
  },
  SET_CURRENT_LEVEL (state, level) {
    state.currentLevel = level
  },
  SET_CURRENT_QUESTION (state, question) {
    state.currentQuestion = question
  },
  SET_USER_PROGRESS (state, progress) {
    state.userProgress = progress
  },
  SET_QUESTIONS (state, questions) {
    state.questions = questions
  }
}

const actions = {
  async initGame ({ commit, state, dispatch }) {
    commit('SET_LOADING', true)

    try {
      const campaignData = await apiService.getCampaignData()
      commit('SET_CAMPAIGN', campaignData)

      const questions = await apiService.getQuestions(35) // Game ID is hardcoded as 35
      commit('SET_QUESTIONS', questions)

      const userProgress = apiService.getUserProgress()
      commit('SET_USER_PROGRESS', userProgress)
    } catch (error) {
    } finally {
      commit('SET_LOADING', false)
    }
  },

  startNewGame ({ commit, state }) {
    commit('SET_GAME_STARTED', true)
    commit('SET_CURRENT_LEVEL', state.campaign.levels[0])
    commit('SET_SHOW_FULL_IMAGE', true)
  },

  startPuzzle ({ commit }) {
    commit('SET_SHOW_FULL_IMAGE', false)
  },

  handleLevelCompletion ({ commit, state, dispatch }, levelData) {
    const level = levelData.level || levelData
    const stats = levelData.stats || { time: 0, moves: 0 }

    const progress = {
      ...state.userProgress,
      [level]: {
        completed: true,
        timestamp: new Date().toISOString(),
        time: stats.time || 0,
        moves: stats.moves || 0
      }
    }

    commit('SET_USER_PROGRESS', progress)
    apiService.saveUserProgress(progress)

    if (level === state.campaign.levels.length) {
      setTimeout(() => {
        commit('SET_GAME_STARTED', false)
      }, 500)
      return
    }

    if (state.questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * state.questions.length)
      const randomQuestion = state.questions[randomIndex]
      commit('SET_CURRENT_QUESTION', randomQuestion)
      commit('SET_SHOW_QUESTION', true)
      const updatedQuestions = [...state.questions]
      updatedQuestions.splice(randomIndex, 1)
      commit('SET_QUESTIONS', updatedQuestions)
    } else {
      dispatch('moveToNextLevel')
    }
  },

  handleAnswer ({ commit, state, dispatch }, answerId) {
    commit('SET_SHOW_QUESTION', false)

    const isCorrect = answerId === state.currentQuestion.correct_answer_id

    if (isCorrect) {
      const progress = {
        ...state.userProgress,
        correctAnswers: (state.userProgress.correctAnswers || 0) + 1
      }
      commit('SET_USER_PROGRESS', progress)
      apiService.saveUserProgress(progress)

      dispatch('moveToNextLevel')
    } else {
      setTimeout(() => {
        commit('SET_GAME_STARTED', false)
      }, 500)
    }
  },

  moveToNextLevel ({ commit, state }) {
    const currentLevelIndex = state.campaign.levels.findIndex(
      l => l.level === state.currentLevel.level
    )
    const nextLevel = state.campaign.levels[currentLevelIndex + 1]
    commit('SET_CURRENT_LEVEL', nextLevel)
    commit('SET_SHOW_FULL_IMAGE', true)

    setTimeout(() => {
      commit('SET_SHOW_FULL_IMAGE', false)
    }, state.previewTime)
  }
}

const getters = {
  campaignNotStarted: state => {
    if (!state.campaign) return false
    return new Date() < new Date(state.campaign.date_start)
  },
  campaignEnded: state => {
    if (!state.campaign) return false
    return new Date() > new Date(state.campaign.date_end)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
