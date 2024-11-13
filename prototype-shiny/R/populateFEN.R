populateFEN <- function(opt) {
  py_chess <- import("chess")
  chessComPuzzle <- "https://api.chess.com/pub/puzzle"
  liChessPuzzle <- "https://lichess.org/api/puzzle/daily"
  if (opt == "standard starting position") {
    return(startFen)
  }
  if (opt == "lichess daily puzzle") {
    content <- GET(liChessPuzzle) %>%
      content()
    if (is.null(content)) {
      showNotification("Error retrieving puzzle. Defaulting to standard starting position.")
      puzzle <- startFen
    }
    pgn <- strsplit(content$game$pgn, " ")[[1]]
    initialPly <- content$puzzle$initialPly
    game <- py_chess$Board()
    for (move in pgn[1:(initialPly + 1)]) {
      game$push_san(move)
    }
    li_chess_state <<- game
    return(game$fen())
  }
  if (opt == "chess.com daily puzzle") {
    tryCatch(
      {
        puzzle <- GET(chessComPuzzle) %>%
          content() %>%
          .$fen
      },
      error = function(e) {
        showNotification("Error retrieving puzzle. Defaulting to standard starting position.")
        puzzle <- startFen
      }
    )
    if (is.null(puzzle)) {
      showNotification("Error retrieving puzzle. Defaulting to standard starting position.")
      puzzle <- startFen
    }
    return(puzzle)
  }
  opt
}
