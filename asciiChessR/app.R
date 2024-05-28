library(shiny)
source("R/fen_map.R")
source("ui.R")
source("server.R")

api_url <- Sys.getenv("API_URL", "http://localhost:8000")

shinyApp(ui, server, options = list(port = 3838))
