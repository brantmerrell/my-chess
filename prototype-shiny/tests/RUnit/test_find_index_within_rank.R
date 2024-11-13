library(RUnit)
source("R/find_index_within_rank.R")

test.find_index_within_rank <- function() {
  checkEquals(find_index_within_rank("8", "c1"), 1)
  checkEquals(find_index_within_rank("8", "c8"), 1)
  checkEquals(find_index_within_rank("PPPP4", "c8"), 3)
  checkEquals(find_index_within_rank("2P5", "c4"), 2)
}
