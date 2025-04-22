const API_BASE_URL = 'https://api.medforum.pl'

/**
 * Service for handling all API calls
 */
const apiService = {
  /**
   * Get campaign data from API
   * @returns {Promise<Object>} Campaign data
   */
  async getCampaignData () {
    return {
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
  },

  /**
   * Get questions from API
   * @param {number} gameId - ID of the game
   * @returns {Promise<Array>} Formatted questions
   */
  async getQuestions (gameId) {
    try {
      const response = await fetch(`${API_BASE_URL}/dyskusjemedyczne/games/${gameId}/questions`)

      if (!response.ok) {
        throw new Error('Problem with fetching questions from API')
      }

      const questionData = await response.json()
      return this.formatQuestions(questionData)
    } catch (error) {
      console.error('Error fetching questions from API:', error)
      return []
    }
  },

  /**
   * Format questions from API to the format needed by the app
   * @param {Array} questionData - Raw question data from API
   * @returns {Array} Formatted questions
   */
  formatQuestions (questionData) {
    return questionData.map(q => {
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
  },

  /**
   * Get user progress from local storage
   * @returns {Object} User progress
   */
  getUserProgress () {
    const savedProgress = localStorage.getItem('puzzleProgress')
    if (savedProgress) {
      return JSON.parse(savedProgress)
    } else {
      return { correctAnswers: 0 }
    }
  },

  /**
   * Save user progress to local storage
   * @param {Object} progress - User progress
   */
  saveUserProgress (progress) {
    localStorage.setItem('puzzleProgress', JSON.stringify(progress))
  }
}

export default apiService
