library(httr)

getLinks <- function(fen_string) {
  endpoint <- "/links/"
  url <- paste0(api_url, endpoint, "?fen_string=", URLencode(fen_string))

  # Use tryCatch to handle errors
  tryCatch(
    {
      response <- GET(url)
      # Check for HTTP errors
      stop_for_status(response)
      return(content(response, "text")) # Assuming the server returns text; adjust as needed
    },
    error = function(e) {
      # Handle the error, e.g., logging or providing an alternative output
      message("Failed to fetch data: ", e$message)
      return(NULL) # Return NULL or another appropriate value on failure
    }
  )
}
