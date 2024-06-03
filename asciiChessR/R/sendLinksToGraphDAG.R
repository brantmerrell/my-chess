library(httr)
library(jsonlite)
library(igraph)
source("config.R")
source("R/remove_all_cycles.R")
sendLinksToGraphDAG <- function(links) {
  endpoint <- "/graphdag/"
  url <- paste0(api_url, endpoint)

  payload <- list(edges = links$edges)

  response <- PUT(url, body = payload, encode = "json")

  if (http_status(response)$category == "Success") {
    return(content(response, "parsed"))
  } else {
    stop("Failed to send links to /graphdag endpoint")
  }
}
