library(httr)
library(rchess)
library(magrittr)

getLiChessPuzzle <- function(link = "https://lichess.org/api/puzzle/daily") {
    content <- GET(link) %>%
        content()
    if (is.null(content)) {
        startFen <- "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        showNotification("Error retrieving puzzle. Defaulting to standard starting position.")
        return(startFen)
    }
    pgn <- strsplit(content$game$pgn," ")[[1]]
    initialPly <- content$puzzle$initialPly
    game <- Chess$new()
    for (move in pgn[1:(initialPly+1)]) {
        game$move(move)
    }
    return(game$fen())
}
