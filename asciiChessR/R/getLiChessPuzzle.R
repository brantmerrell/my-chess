library(httr)
library(chess)
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
    game <- game()
    for (move in pgn[1:(initialPly+1)]) {
        game <- game %>% move(move)
    }
    return(fen(game))
}
