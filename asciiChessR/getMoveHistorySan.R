library(reticulate)

getMoveHistorySan <- function(move_history) { 
  source_python("chess_utils.py")
  moves <- get_move_history_san(move_history)
  moves
} 
