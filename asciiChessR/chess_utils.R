library(reticulate)

getLegalMovesSan <- function(fen) {
  source_python("chess_utils.py")
  moves <- get_legal_moves_san(fen)
  moves
}

getMoveHistorySan <- function(move_history) {
  source_python("chess_utils.py")
  moves <- get_move_history_san(move_history)
  moves
}
