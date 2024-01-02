library(rchess)
library(magrittr)
source("R/asciiPrint.R")
source("R/asciiSub.R")

mySummary <- function(chessObject) {
    cat(paste("FEN:", chessObject$fen(), "\n"))
    cat("\nBoard:\n")
    ascii <- chessObject$ascii() %>% 
        capture.output() %>%
        asciiSub(pattern = "\\.", replacement = " ")
    ascii[11] <- paste(ascii[11], " ")
    masked <- ascii %>%
        asciiSub(pattern = "[[:alpha:]]", replacement = "✱")
    paste(ascii, masked) %>%
        asciiPrint
    cat(paste("\nTurn:", ifelse(chessObject$turn() == "w", "White", "Black"), "\n"))
    cat(paste(c("\nHistory:", chessObject$history(), "\n")))
    cat("\nOptions to move:\n")
    cat(chessObject$moves() %>% sort())
}

