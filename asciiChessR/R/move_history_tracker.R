library(reticulate)

move_history_store <- NULL

initialize_move_history <- function(initial_fen = NULL) {
  if (is.null(initial_fen)) {
    initial_fen <- "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }

  move_history_store <<- data.frame(
    ply = 0,
    san = NA_character_,
    uci = NA_character_,
    fen = initial_fen,
    stringsAsFactors = FALSE
  )

  return(move_history_store)
}

track_move_history <- function(chess_board = NULL, san_move = NULL) {
  if (is.null(move_history_store)) {
    if (!is.null(chess_board)) {
      initialize_move_history(chess_board$fen())
    } else {
      initialize_move_history()
    }
    return(move_history_store)
  }

  if (is.null(chess_board) || is.null(san_move)) {
    return(move_history_store)
  }

  ply <- nrow(move_history_store)

  move <- chess_board$peek()
  uci_move <- move$uci()

  current_fen <- chess_board$fen()

  new_row <- data.frame(
    ply = ply,
    san = san_move,
    uci = uci_move,
    fen = current_fen,
    stringsAsFactors = FALSE
  )

  move_history_store <<- rbind(move_history_store, new_row)

  return(move_history_store)
}

reset_move_history <- function(initial_fen = NULL) {
  initialize_move_history(initial_fen)
  return(move_history_store)
}

undo_move_history <- function() {
  if (!is.null(move_history_store) && nrow(move_history_store) > 1) {
    move_history_store <<- move_history_store[-nrow(move_history_store), ]
  }
  return(move_history_store)
}
