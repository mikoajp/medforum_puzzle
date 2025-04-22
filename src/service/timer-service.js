export default class TimerService {
  constructor () {
    this.startTime = null
    this.elapsedTime = 0
    this.timer = null
    this.timerCallback = null
  }

  /**
   * Starts the game timer
   * @param {Function} callback - Optional callback to be called on each timer tick
   */
  startTimer (callback = null) {
    this.startTime = Date.now()
    this.elapsedTime = 0
    this.timerCallback = callback

    this.timer = setInterval(() => {
      this.updateElapsedTime()

      if (this.timerCallback) {
        this.timerCallback(this.elapsedTime)
      }
    }, 1000)
  }

  /**
   * Stops the game timer
   */
  stopTimer () {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * Updates the elapsed time
   * @returns {number} - Current elapsed time in seconds
   */
  updateElapsedTime () {
    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000)
    return this.elapsedTime
  }

  /**
   * Gets the current elapsed time
   * @returns {number} - Current elapsed time in seconds
   */
  getElapsedTime () {
    return this.elapsedTime
  }

  /**
   * Formats the time in MM:SS format
   * @param {number} seconds - Time in seconds to format
   * @returns {string} - Formatted time string
   */
  formatTime (seconds) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Restarts the timer
   * @param {Function} callback - Optional callback to be called on each timer tick
   */
  restartTimer (callback = null) {
    this.stopTimer()
    this.startTimer(callback)
  }

  /**
   * Checks if the timer is currently running
   * @returns {boolean} - True if timer is running
   */
  isRunning () {
    return this.timer !== null
  }
}
