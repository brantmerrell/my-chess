library(RUnit)
source("R/fen_description.R")

test.fen_description <- function() {
  concise_standard <- readLines(file.path("testdata/StandardSetupFEN-concise.txt"))
  verbose_standard <- readLines(file.path("testdata/StandardSetupFEN-verbose.txt"))

  checkEquals(fen_description("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"), concise_standard)
  checkEquals(fen_description("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", verbose_ranks = TRUE), verbose_standard)
}
