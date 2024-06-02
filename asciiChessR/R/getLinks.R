library(httr)
source("config.R")

getLinks <- function(fen_string) {
  # base_url <- "http://connector:8000"
  endpoint <- "/links/"
  url <- paste0(api_url, endpoint, "?fen_string=", URLencode(fen_string))
  response <- GET(url)
  return(content(response))
}
