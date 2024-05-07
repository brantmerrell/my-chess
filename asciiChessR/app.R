library(shiny)
source("R/fen_map.R")
source("ui.R")
source("server.R")


shinyApp(ui, server, options=list(port=5679))

