# move_history_tracker.R
library(reticulate)

# Initialize a reactive value to store the move history
move_history_store <- NULL

initialize_move_history <- function(initial_fen = NULL) {
  # If no FEN provided, use standard starting position
  if (is.null(initial_fen)) {
    initial_fen <- "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }

  # Create initial history with starting position
  move_history_store <<- data.frame(
    move_number = 0, # 0 indicates initial position
    san = NA_character_, # No move yet
    uci = NA_character_, # No move yet
    fen = initial_fen,
    stringsAsFactors = FALSE
  )

  return(move_history_store)
}

track_move_history <- function(chess_board = NULL, san_move = NULL) {
  # Initialize if NULL with current board position
  if (is.null(move_history_store)) {
    if (!is.null(chess_board)) {
      initialize_move_history(chess_board$fen())
    } else {
      initialize_move_history()
    }
    return(move_history_store)
  }

  # If no new move, just return current history
  if (is.null(chess_board) || is.null(san_move)) {
    return(move_history_store)
  }

  # Get the move number
  move_number <- nrow(move_history_store)

  # Get the UCI notation for the move
  move <- chess_board$peek() # Get the last move made
  uci_move <- move$uci()

  # Get the current FEN after the move
  current_fen <- chess_board$fen()

  # Create new row
  new_row <- data.frame(
    move_number = move_number,
    san = san_move,
    uci = uci_move,
    fen = current_fen,
    stringsAsFactors = FALSE
  )

  # Add the new move to the history
  move_history_store <<- rbind(move_history_store, new_row)

  return(move_history_store)
}

reset_move_history <- function(initial_fen = NULL) {
  initialize_move_history(initial_fen)
  return(move_history_store)
}

undo_move_history <- function() {
  if (!is.null(move_history_store) && nrow(move_history_store) > 1) {
    # Keep at least the initial position row
    move_history_store <<- move_history_store[-nrow(move_history_store), ]
  }
  return(move_history_store)
}
