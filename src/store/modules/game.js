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

    // Pobierz pytania (mock)
    try {
      const questions = [
        {
          id: 1,
          question: 'Czy wskazaniem do stosowania leku Azelin jest:',
          answers: [
            { id: 1, text: 'Zapalenie spojówki alericznym sezonowym' },
            { id: 2, text: 'Zapalenie spojówki alergicznym odpornościowo' },
            { id: 3, text: 'Zapalenie spojówki nieżytowe' },
            { id: 4, text: 'Zapalenie spojówki bakteryjne' }
          ],
          correct_answer_id: 1
        },
        {
          id: 2,
          question: 'Kiedy można stosować lek Azelin?',
          answers: [
            { id: 5, text: 'U osób poniżej 4 roku życia' },
            { id: 6, text: 'U dzieci w wieku od 4 lat i dorosłych' },
            { id: 7, text: 'Tylko u osób dorosłych' }
          ],
          correct_answer_id: 6
        },
        {
          id: 3,
          question: 'Jak często należy stosować lek Azelin?',
          answers: [
            { id: 8, text: 'Raz dziennie' },
            { id: 9, text: 'Dwa razy dziennie' },
            { id: 10, text: 'Trzy razy dziennie' },
            { id: 11, text: 'Cztery razy dziennie' }
          ],
          correct_answer_id: 9
        }
      ]
      commit('SET_QUESTIONS', questions)
    } catch (error) {
      console.error('Error loading questions:', error)
    }

    // Wczytaj postęp użytkownika z localStorage
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
    // Zapisz ukończony poziom z danymi statystycznymi
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

    // Sprawdź czy to ostatni poziom
    if (level.level === state.campaign.levels.length) {
      // Gra zakończona
      setTimeout(() => {
        alert('Gratulacje! Ukończyłeś wszystkie poziomy!')
        commit('SET_GAME_STARTED', false)
      }, 500)
      return
    }

    // Pokaż pytanie przed następnym poziomem
    const randomIndex = Math.floor(Math.random() * state.questions.length)
    const randomQuestion = state.questions[randomIndex]
    commit('SET_CURRENT_QUESTION', randomQuestion)
    commit('SET_SHOW_QUESTION', true)
  },

  handleAnswer ({ commit, state, dispatch }, answerId) {
    commit('SET_SHOW_QUESTION', false)

    const isCorrect = answerId === state.currentQuestion.correct_answer_id

    if (isCorrect) {
      // Aktualizuj liczbę poprawnych odpowiedzi
      const progress = {
        ...state.userProgress,
        correctAnswers: (state.userProgress.correctAnswers || 0) + 1
      }
      commit('SET_USER_PROGRESS', progress)
      localStorage.setItem('puzzleProgress', JSON.stringify(progress))

      // Przejdź do następnego poziomu
      const currentLevelIndex = state.campaign.levels.findIndex(
        l => l.level === state.currentLevel.level
      )
      const nextLevel = state.campaign.levels[currentLevelIndex + 1]
      commit('SET_CURRENT_LEVEL', nextLevel)
      commit('SET_SHOW_FULL_IMAGE', true)
    } else {
      // Błędna odpowiedź - koniec gry
      setTimeout(() => {
        alert('Niestety, błędna odpowiedź. Gra zakończona.')
        commit('SET_GAME_STARTED', false)
      }, 500)
    }
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
