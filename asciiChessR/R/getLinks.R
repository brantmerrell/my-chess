library(httr)

getLinks <- function(fen_string) {
  endpoint <- "/links/"
  url <- paste0(api_url, endpoint, "?fen_string=", URLencode(fen_string))

  tryCatch(
    {
      response <- GET(url)
      stop_for_status(response)
      return(content(response, "text"))
    },
    error = function(e) {
      message("Failed to fetch data: ", e$message)
      return(NULL)
    }
  )
}
