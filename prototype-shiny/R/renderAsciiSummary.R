library(magrittr)
source("R/asciiPrint.R")
source("R/asciiSub.R")
source("chess_utils.R")

renderAsciiSummary <- function(chessObject, patterns = c("\\."), replacements = c(" ")) {
  fen <- chessObject$fen()
  cat(paste("FEN:", fen, "\n"))

  cat("\nBoard:\n")
  boardLines <- chessObject$`__str__`() %>%
    strsplit("\n") %>%
    unlist()

  if (length(patterns) != length(replacements)) {
    stop("patterns and replacements must have the same length")
  }
  for (i in 1:length(patterns)) {
    boardLines <- asciiSub(patterns[i], replacements[i], boardLines)
  }

  boardLines %>% asciiPrint()

  cat(paste("\nTurn:", ifelse(chessObject$turn, "White", "Black"), "\n"))
  # history <- paste(c("History:", getMoveHistorySan(chessObject$move_stack)), collapse = " ")
  # cat(history, "\n")

  cat("\nOptions to move:\n")
  cat(getLegalMovesSan(fen) %>% sort())
  cat("\n")
}
