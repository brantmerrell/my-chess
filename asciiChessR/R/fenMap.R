fenMap <- function(chess_data) {
  x <- fen_map(chess_data$fen())
  for (l in x) {
    cat(l, "\n")
  }
}
