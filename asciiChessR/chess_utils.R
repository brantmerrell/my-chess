library(reticulate)

getLegalMovesSan <- function(fen) {
  source_python("chess_utils.py")
  moves <- get_legal_moves_san(fen)
  if (length(moves) == 0) {
    return(NULL)
  }
  moves
}

getMoveHistorySan <- function(move_history) {
  source_python("chess_utils.py")
  moves <- get_move_history_san(move_history)
  moves
}

getEdges <- function(board) {
  source_python("chess_utils.py")
  edges <- get_edges(board)
  edges
}

getNodes <- function(board) {
  source_python("chess_utils.py")
  nodes <- get_nodes(board)
  nodes
}
