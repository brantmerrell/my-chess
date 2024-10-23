library(httr)
library(ggplot2)
library(reticulate)
library(magrittr)
library(yaml)
library(igraph)
library(DT)
source("chess_utils.R")
source("R/renderAsciiSummary.R")
source("R/globals.R")
source("R/fenMap.R")
source("R/fen_description.R")
source("R/populateFEN.R")
source("R/asciiPrint.R")
source("R/asciiSub.R")
source("R/sendLinksToGraphDAG.R")
py_chess <- import("chess")
server <- function(input, output, session) {
  chess <- py_chess$Board()
  lichess_state <- chess
  links <- do.call(rbind.data.frame, lapply(getEdges(chess), as.data.frame))

  # Define connections
  connections <- links


  asciiBoard <- reactiveVal(capture.output(renderAsciiSummary(chess)))
  helperVisual <- reactiveVal({
    links_data <- getEdges(chess)
    connections <- do.call(rbind.data.frame, lapply(links_data, as.data.frame))
    capture.output(fenMap(chess, connections))
  })
  server_down_message <- readLines("server-down.txt", warn = FALSE)
  links <- reactiveVal({
    fen_string <- chess$fen()
    links_data$edges <- do.call(rbind.data.frame, lapply(getEdges(chess), as.data.frame))
    if (is.null(links_data)) {
      server_down_message
    } else {
      connections <<- links_data$edges
      links_data
    }
  })
  fenDescription <- reactiveVal({
    fen_description(chess$fen(), verbose_ranks = TRUE) %>%
      as.yaml()
  })
  updateChessDependencies <- function() {
    asciiBoard(capture.output(renderAsciiSummary(chess)))
    links_list <- getEdges(chess)
    links_data$edges <- do.call(rbind.data.frame, lapply(links_list, as.data.frame))
    connections <<- links_data$edges
    helperVisual(capture.output(fenMap(chess, connections)))
    fenDescription(fen_description(chess$fen(), verbose_ranks = TRUE) %>% as.yaml())
    updateAvailableMoves()
  }

  updateAvailableMoves <- function() {
    availableMoves <- getLegalMovesSan(chess$fen()) %>% sort()
    updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
  }
  updateAvailableMoves()
  observeEvent(input$selectedFEN, {
    updateTextInput(session, "fen", value = populateFEN(input$selectedFEN))
  })

  observeEvent(input$submitFEN, {
    fen_result <- tryCatch(
      {
        chess$set_fen(input$fen)
        TRUE
      },
      error = function(e) {
        FALSE
      }
    )
    if (!fen_result) {
      showNotification("Invalid FEN. Please try again.")
    } else {
      if (input$selectedFEN == "lichess daily puzzle") {
        chess <<- lichess_state
      }
      updateChessDependencies()
    }
  })

  observeEvent(input$submitMove, {
    move_result <- tryCatch(
      {
        chess$push_san(input$move)
        TRUE
      },
      error = function(e) {
        FALSE
      }
    )
    if (!move_result) {
      showNotification("Invalid move. Please try again.")
    } else {
      updateChessDependencies()
    }
  })

  observeEvent(input$undo, {
    if (length(chess$move_stack) > 0) {
      chess$pop()
      updateChessDependencies()
    }
  })

  observeEvent(input$selectedMove, {
    updateTextInput(session, "move", value = input$selectedMove)
  })

  output$board <- renderText({
    asciiBoard() %>%
      paste(collapse = "\n") %>%
      gsub(
        pattern = "\\.",
        replacement = " "
      )
  })
  output$dynamicOutput <- renderUI({
    if (input$selectedVisual %in% c("Table View", "Plot View")) {
      if (input$selectedVisual == "Table View") {
        dataTableOutput("tableView")
      } else if (input$selectedVisual == "Plot View") {
        plotOutput("plotView")
      }
    } else {
      verbatimTextOutput("textHelper")
    }
  })

  output$textHelper <- renderText({
    switch(input$selectedVisual,
      "Diagon Links" = {
        links_data <- links()
        if (identical(links_data, server_down_message)) {
          paste(server_down_message, collapse = "\n")
        } else {
          graphdag_response <- sendLinksToGraphDAG(links_data)
          ascii_art <- paste(unlist(strsplit(graphdag_response[[1]], "\n")), collapse = "\n")
          if (!is.null(ascii_art) && nzchar(ascii_art)) {
            ascii_art
          } else {
            "No ASCII graph returned from the /graphdag endpoint."
          }
        }
      },
      "Link List" = {
        links_data <- links()
        if (identical(links_data, server_down_message)) {
          paste(server_down_message, collapse = "\n")
        } else {
          graph_text <- paste(paste(links_data$edges$source, links_data$edges$target, sep = "->"), collapse = "\n")
          graph_text
        }
      },
      "FEN map" = {
        paste(helperVisual(), collapse = "\n")
      },
      "FEN description" = {
        fenDescription()
      },
      "Select Helper Visual"
    )
  })

  # Data table for Table View
  output$tableView <- DT::renderDT({
    data.frame(Number = 1:12, Letter = LETTERS[1:12])
  })

  # Plot for Plot View
  output$plotView <- renderPlot({
    # Assuming links_data is in the same format as the JSON example provided
    links_data <- links()

    if (identical(links_data, server_down_message)) {
      # Handle the case where the server is down or data is not available
      return()
    }
    # Create an igraph object from the links data
    g <- graph_from_data_frame(d = links_data$edges, directed = TRUE)

    # Optional: Set node and edge attributes (e.g., color, shape) based on your preferences
    V(g)$color <- "blue"
    E(g)$color <- "black"

    # Plot the graph
    plot(g, layout = layout_with_sugiyama, edge.arrow.size = 0.5)
  })
}
