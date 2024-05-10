library(httr)
get_links <- function(fen_string) {
    base_url <- "http://127.0.0.1:5001"
    endpoint <- "/links/"
    url <- paste0(base_url, endpoint, "?fen_string=", URLencode(fen_string))
    response <- GET(url)
    return(content(response))
}
