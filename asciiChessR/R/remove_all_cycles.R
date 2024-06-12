library(igraph)

remove_all_cycles <- function(g) {
  scc <- components(g, mode = "strong")
  while (any(scc$csize > 1)) {
    for (i in which(scc$csize > 1)) {
      subg_nodes <- which(scc$membership == i)
      should_break <- FALSE
      for (node in subg_nodes) {
        out_neighbors <- neighbors(g, node, mode = "out")
        for (neighbor in out_neighbors) {
          if (neighbor %in% subg_nodes) {
            edge_to_remove <- get.edge.ids(g, c(node, neighbor), directed = TRUE)
            g <- delete_edges(g, edge_to_remove)
            should_break <- TRUE
            break
          }
        }
        if (should_break) break
      }
    }
    scc <- components(g, mode = "strong")
  }
  return(g)
}
