context("Testing fen_description function")
source("../../R/fen_description.R")

test_that("fen_description produces correct concise and verbose descriptions", {
  path <- system.file("testdata", package = "myRpackage")
  concise_standard <- readLines("../../testdata/StandardSetupFEN-concise.txt")
  verbose_standard <- readLines("../../testdata/StandardSetupFEN-verbose.txt")

  expect_equal(fen_description("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", verbose_ranks = TRUE), verbose_standard)
  expect_equal(fen_description("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"), concise_standard)
})
