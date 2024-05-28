library(httr)
getLinks <- function(fen_string) {
  base_url <- "http://127.0.0.1:8000"
  endpoint <- "/links/"
  url <- paste0(base_url, endpoint, "?fen_string=", URLencode(fen_string))
  response <- GET(url)
  return(content(response))
}
