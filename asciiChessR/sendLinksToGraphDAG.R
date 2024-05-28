library(httr)

sendLinksToGraphDAG <- function(links) {
  print("sendLinksToGraphDAG(links)")
  base_url <- "http://127.0.0.1:8000"
  endpoint <- "/graphdag/"
  url <- paste0(base_url, endpoint)

  payload <- list(edges = links$edges)

  response <- PUT(url, body = payload, encode = "json")
  print("response:")
  print(response)

  if (http_status(response)$category == "Success") {
    return(content(response, "parsed"))
  } else {
    stop("Failed to send links to /graphdag endpoint")
  }
}
