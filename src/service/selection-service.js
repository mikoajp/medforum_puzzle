export default class SelectionService {
  constructor () {
    this.selectedPiece = null
  }

  /**
   * Manages the selection state of puzzle pieces
   * @param {Object} piece - The piece being clicked
   * @param {Object} gameLogic - The game logic instance
   * @returns {Object} - Result of the selection operation
   */
  handlePieceSelection (piece, gameLogic) {
    if (!this.selectedPiece) {
      this.selectedPiece = piece
      return {
        selectedPiece: piece,
        completed: false,
        action: 'selected'
      }
    } else if (this.selectedPiece.id === piece.id) {
      this.selectedPiece = null
      return {
        selectedPiece: null,
        completed: false,
        action: 'deselected'
      }
    } else {
      const completed = gameLogic.swapPieces(this.selectedPiece, piece)
      this.selectedPiece = null

      return {
        selectedPiece: null,
        completed: completed,
        action: 'swapped'
      }
    }
  }

  /**
   * Gets the currently selected piece
   * @returns {Object|null} - The selected piece or null if none
   */
  getSelectedPiece () {
    return this.selectedPiece
  }

  /**
   * Sets the selected piece
   * @param {Object|null} piece - The piece to select or null to clear selection
   */
  setSelectedPiece (piece) {
    this.selectedPiece = piece
  }

  /**
   * Clears the current selection
   */
  clearSelection () {
    this.selectedPiece = null
  }
}
