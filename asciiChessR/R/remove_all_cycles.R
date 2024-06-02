library(igraph)

# Enhanced function to remove all cycles
remove_all_cycles <- function(g) {
  scc <- components(g, mode = "strong")
  # Continue while there is any SCC with more than one node
  while (any(scc$csize > 1)) {
    for (i in which(scc$csize > 1)) {
      subg_nodes <- which(scc$membership == i)
      # Control variable for breaking out of nested loops
      should_break <- FALSE
      # Attempt to remove an edge from each node in the SCC
      for (node in subg_nodes) {
        out_neighbors <- neighbors(g, node, mode = "out")
        for (neighbor in out_neighbors) {
          if (neighbor %in% subg_nodes) {
            edge_to_remove <- get.edge.ids(g, c(node, neighbor), directed = TRUE)
            g <- delete_edges(g, edge_to_remove)
            should_break <- TRUE # Set the control variable to true
            break # Break the innermost loop
          }
        }
        if (should_break) break # Break the outer loop if the control variable is true
      }
    }
    scc <- components(g, mode = "strong") # Recompute SCCs after modifications
  }
  return(g)
}
