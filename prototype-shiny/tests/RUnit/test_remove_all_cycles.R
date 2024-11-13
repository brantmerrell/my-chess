library(RUnit)
source("R/remove_all_cycles.R")

test.remove_cycles <- function() {
  g <- graph(edges = c("A", "B", "B", "C", "C", "D", "D", "A"), directed = TRUE)
  checkTrue(has_eulerian_cycle(g))

  res <- remove_all_cycles(g)
  checkTrue(!has_eulerian_cycle(res))
}

test.remove_nested_cycles <- function() {
  g <- graph(
    edges = c(
      "A", "B", "B", "C", "C", "D", "D", "E", "E", "A",
      "C", "E", "E", "C"
    ),
    directed = TRUE
  )
  checkTrue(has_eulerian_cycle(g))

  res <- remove_all_cycles(g)
  checkTrue(!has_eulerian_cycle(res))
}

test.remove_multiple_overlapping_cycles <- function() {
  g <- graph(edges = c(
    "A", "B", "B", "C", "C", "D", "D", "A",
    "B", "D", "C", "A"
  ), directed = TRUE)
  checkTrue(!has_eulerian_cycle(g))

  res <- remove_all_cycles(g)
  checkTrue(!has_eulerian_cycle(res))
}
