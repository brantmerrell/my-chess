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
source("R/move_history_tracker.R")

server <- function(input, output, session) {
  py_chess <- import("chess")
  chess <- py_chess$Board()
  lichess_state <- chess

  track_move_history(chess)
  moveHistory <- reactiveVal(NULL)
  asciiBoard <- reactiveVal()
  helperVisual <- reactiveVal()
  links <- reactiveVal()
  fenDescription <- reactiveVal()

  server_down_message <- readLines("server-down.txt", warn = FALSE)

  links_data <- list()
  connections <- NULL

  updateChessDependencies <- function() {
    asciiBoard(capture.output(renderAsciiSummary(chess)))

    links_list <- getEdges(chess)
    links_data$edges <- do.call(rbind.data.frame, lapply(links_list, as.data.frame))
    connections <<- links_data$edges

    links(links_data)

    helperVisual(capture.output(fenMap(chess, connections)))
    fenDescription(fen_description(chess$fen(), verbose_ranks = TRUE) %>% as.yaml())

    current_history <- track_move_history(chess)
    moveHistory(current_history)

    updateAvailableMoves()
  }

  updateAvailableMoves <- function() {
    availableMoves <- getLegalMovesSan(chess$fen()) %>% sort()
    updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
  }

  updateAvailableMoves()
  updateChessDependencies()

  observeEvent(input$selectedFEN, {
    updateTextInput(session, "fen", value = populateFEN(input$selectedFEN))
  })

  observeEvent(input$submitFEN, {
    fen_result <- tryCatch(
      {
        chess$set_fen(input$fen)
        reset_move_history(input$fen)
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
        current_history <- track_move_history(chess, input$move)
        moveHistory(current_history)
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
      current_history <- undo_move_history()
      moveHistory(current_history)
      updateChessDependencies()
    }
  })

  observeEvent(input$selectedMove, {
    updateTextInput(session, "move", value = input$selectedMove)
  })

  output$board <- renderText({
    asciiBoard() %>%
      paste(collapse = "\n") %>%
      gsub(pattern = "\\.", replacement = " ")
  })

  output$dynamicOutput <- renderUI({
    if (input$selectedVisual %in% c("History Table", "Plot View")) {
      if (input$selectedVisual == "History Table") {
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
      "Move History" = {
        move_history_df <- track_move_history()
        if (!is.null(move_history_df)) {
          capture.output(print(move_history_df)) %>% paste(collapse = "\n")
        } else {
          "No moves recorded yet."
        }
      },
      "Select Helper Visual"
    )
  })

  output$tableView <- DT::renderDT({
    history <- moveHistory()

    if (!is.null(history)) {
      DT::datatable(
        history,
        options = list(
          pageLength = 10,
          order = list(list(0, "desc")),
          scrollX = TRUE
        ),
        rownames = FALSE
      )
    }
  })
  output$plotView <- renderPlot({
    links_data <- links()

    if (identical(links_data, server_down_message) || is.null(links_data) || nrow(links_data$edges) == 0) {
      return(NULL)
    }

    edge_df <- links_data$edges[, c("source", "target", "type")]

    edge_colors <- ifelse(edge_df$type == "threat", "red", "green")

    g <- graph_from_data_frame(d = edge_df, directed = TRUE)

    V(g)$color <- rep("lightblue", vcount(g))

    E(g)$color <- edge_colors
    E(g)$arrow.size <- 0.5
    plot(g,
      layout = layout_on_grid(g), # layout_as_star layout_in_circle layout_nicely layout_on_grid layout_on_sphere layout_randomly layout_with_fr layout.auto layout.grid.3d layout.svd
      edge.arrow.size = 0.5,
      vertex.label.color = "black",
      vertex.label.cex = 0.8,
      vertex.size = 25,
      main = "Chess Position Graph",
      sub = paste("Turn:", ifelse(chess$turn, "White", "Black"))
    )
  })
}
