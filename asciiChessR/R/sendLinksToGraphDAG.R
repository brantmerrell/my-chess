library(httr)
library(jsonlite)
library(igraph)
source("config.R")
source("R/remove_all_cycles.R")

#' Send Links to GraphDAG API Endpoint
#'
#' This function takes a list of chess piece relationships and sends them to the GraphDAG
#' endpoint for visualization. It handles various edge cases and provides detailed error messages.
#'
#' @param links A list containing an 'edges' data frame with columns: source, target, and type
#' @return A list containing either the API response or an error message
#' @export
sendLinksToGraphDAG <- function(links) {
  # Input validation
  if (is.null(links)) {
    return(list("No links provided"))
  }

  if (!is.list(links) || !("edges" %in% names(links))) {
    return(list("Invalid links format: missing edges data"))
  }

  if (nrow(links$edges) == 0) {
    return(list("No edges to process"))
  }

  # Validate required columns
  required_columns <- c("source", "target", "type")
  if (!all(required_columns %in% names(links$edges))) {
    missing_cols <- setdiff(required_columns, names(links$edges))
    return(list(sprintf("Missing required columns: %s", paste(missing_cols, collapse = ", "))))
  }

  # Prepare the endpoint URL
  if (is.null(api_url) || nchar(api_url) == 0) {
    return(list("API URL not configured"))
  }

  endpoint <- "/graphdag/"
  url <- paste0(api_url, endpoint)

  # Prepare the payload
  # Remove any cycles from the graph to ensure proper DAG structure
  edges_df <- links$edges
  g <- graph_from_data_frame(edges_df, directed = TRUE)
  g_acyclic <- remove_all_cycles(g)

  # Convert back to data frame
  edges_acyclic <- as_data_frame(g_acyclic, what = "edges")

  # Ensure we preserve the 'type' information
  edges_acyclic$type <- edges_df$type[match(
    paste(edges_acyclic$from, edges_acyclic$to),
    paste(edges_df$source, edges_df$target)
  )]

  # Rename columns to match expected format
  edges_acyclic$source <- edges_acyclic$from
  edges_acyclic$target <- edges_acyclic$to
  edges_acyclic$from <- NULL
  edges_acyclic$to <- NULL

  payload <- list(edges = edges_acyclic)

  # Make the API request with comprehensive error handling
  tryCatch(
    {
      # Set timeout to avoid hanging
      response <- httr::PUT(
        url = url,
        body = toJSON(payload, auto_unbox = TRUE),
        encode = "json",
        add_headers("Content-Type" = "application/json"),
        config = timeout(5)
      )

      # Check for HTTP errors
      if (http_status(response)$category == "Success") {
        # Try to parse the response
        parsed_response <- tryCatch(
          {
            content(response, "parsed")
          },
          error = function(e) {
            return(list(sprintf("Failed to parse API response: %s", e$message)))
          }
        )

        if (is.null(parsed_response)) {
          return(list("Received empty response from server"))
        }

        return(parsed_response)
      } else {
        # Handle different types of HTTP errors
        status_code <- status_code(response)
        error_message <- http_status(response)$message

        if (status_code == 404) {
          return(list("GraphDAG endpoint not found"))
        } else if (status_code == 400) {
          return(list("Invalid request format"))
        } else if (status_code == 500) {
          return(list("Server error processing the graph"))
        } else {
          return(list(sprintf("HTTP error %d: %s", status_code, error_message)))
        }
      }
    },
    error = function(e) {
      # Handle connection errors
      if (inherits(e, "timeout")) {
        return(list("Request timed out"))
      } else if (inherits(e, "curl_error")) {
        return(list(sprintf("Connection error: %s", e$message)))
      } else {
        return(list(sprintf("Unexpected error: %s", e$message)))
      }
    }
  )
}

#' Validate Links Format
#'
#' Helper function to validate the format of links data
#'
#' @param links A list containing an edges data frame
#' @return Boolean indicating if the format is valid
#' @keywords internal
validateLinksFormat <- function(links) {
  if (!is.list(links) || !("edges" %in% names(links))) {
    return(FALSE)
  }

  if (!is.data.frame(links$edges)) {
    return(FALSE)
  }

  required_cols <- c("source", "target", "type")
  if (!all(required_cols %in% names(links$edges))) {
    return(FALSE)
  }

  return(TRUE)
}

#' Format Error Message
#'
#' Helper function to format error messages consistently
#'
#' @param message The error message
#' @param details Additional error details (optional)
#' @return A formatted error message string
#' @keywords internal
formatErrorMessage <- function(message, details = NULL) {
  if (is.null(details)) {
    return(sprintf("Error: %s", message))
  } else {
    return(sprintf("Error: %s\nDetails: %s", message, details))
  }
}
