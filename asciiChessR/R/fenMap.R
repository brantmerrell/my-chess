fenMap <- function(chess_data, connections) {
  x <- fen_map(chess_data$fen(), connections)
  for (l in x) {
    cat(l, "\n")
  }
}
