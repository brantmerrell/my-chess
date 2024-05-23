library(httr)

sendLinksToGraphDAG <- function(links) {
    base_url <- "http://127.0.0.1:5001"
    endpoint <- "/graphdag/"
    url <- paste0(base_url, endpoint)
    
    # Prepare the JSON payload
    payload <- list(edges = links$edges)
    
    # Send the PUT request
    response <- PUT(url, body = payload, encode = "json")
    print("response:")
    print(response)
    
    if (http_status(response)$category == "Success") {
        return(content(response, "parsed"))
    } else {
        stop("Failed to send links to /graphdag endpoint")
    }
}

