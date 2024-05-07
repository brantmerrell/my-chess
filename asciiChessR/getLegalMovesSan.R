library(reticulate)

getLegalMovesSan <- function(fen) {
  source_python("chess_utils.py") 
  moves <- get_legal_moves_san(fen)
  moves
} 

