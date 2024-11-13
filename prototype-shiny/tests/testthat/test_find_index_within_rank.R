context("Testing find_index_within_rank function")
source("../../R/find_index_within_rank.R")

test_that("find_index_within_rank returns correct index", {
  expect_equal(find_index_within_rank("8", "c1"), 1)
  expect_equal(find_index_within_rank("8", "c8"), 1)
  expect_equal(find_index_within_rank("PPPP4", "c8"), 3)
  expect_equal(find_index_within_rank("2P5", "c4"), 2)
})
