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
  previewTime: 3000 // 3 sekundy podglądu
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

    // Mock danych kampanii
    const campaignData = {
      id: 1,
      title: 'Puzzle',
      date_start: '2025-02-16 00:00:00',
      date_end: '2025-05-30 23:59:59',
      levels: [
        { level: 1, image: 'https://picsum.photos/600/600?random=1', elements: 9 },
        { level: 2, image: 'https://picsum.photos/600/600?random=2', elements: 9 },
        { level: 3, image: 'https://picsum.photos/600/600?random=3', elements: 16 },
        { level: 4, image: 'https://picsum.photos/600/600?random=4', elements: 16 },
        { level: 5, image: 'https://picsum.photos/600/600?random=5', elements: 25 },
        { level: 6, image: 'https://picsum.photos/600/600?random=6', elements: 25 }
      ]
    }

    commit('SET_CAMPAIGN', campaignData)

    // Pobierz pytania z API
    try {
      const response = await fetch('https://api.medforum.pl/dyskusjemedyczne/games/35/questions')
      if (!response.ok) {
        throw new Error('Problem z pobraniem pytań z API')
      }

      const questionData = await response.json()
      const formattedQuestions = questionData.map(q => {
        return {
          id: q.id || Math.random().toString(36).substr(2, 9),
          question: q.question,
          answers: q.answers.map(a => ({
            id: a.answer,
            text: a.answer,
            correct: a.correct
          })),
          correct_answer_id: q.answers.find(a => a.correct).answer
        }
      })

      console.log('Pobrano pytania z API:', formattedQuestions)
      commit('SET_QUESTIONS', formattedQuestions)
    } catch (error) {
      console.error('Błąd podczas pobierania pytań z API:', error)
      commit('SET_QUESTIONS', [])
    }
    const savedProgress = localStorage.getItem('puzzleProgress')
    if (savedProgress) {
      commit('SET_USER_PROGRESS', JSON.parse(savedProgress))
    } else {
      commit('SET_USER_PROGRESS', { correctAnswers: 0 })
    }

    commit('SET_LOADING', false)
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
    localStorage.setItem('puzzleProgress', JSON.stringify(progress))
    if (level === state.campaign.levels.length) {
      setTimeout(() => {
        alert('Gratulacje! Ukończyłeś wszystkie poziomy!')
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
      localStorage.setItem('puzzleProgress', JSON.stringify(progress))

      // Przejdź do następnego poziomu
      dispatch('moveToNextLevel')
    } else {
      // Błędna odpowiedź - koniec gry
      setTimeout(() => {
        alert('Niestety, błędna odpowiedź. Gra zakończona.')
        commit('SET_GAME_STARTED', false)
      }, 500)
    }
  },

  moveToNextLevel ({ commit, state }) {
    // Przejdź do następnego poziomu
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
