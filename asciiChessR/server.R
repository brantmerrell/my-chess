library(httr)
library(ggplot2)
library(reticulate)
library(magrittr)
library(yaml)
source("chess_utils.R")
source("R/renderAsciiSummary.R")
source("R/globals.R")
source("R/fenMap.R")
source("R/fen_description.R")
source("R/populateFEN.R")
source("R/asciiPrint.R")
source("R/asciiSub.R")
source("R/getLinks.R")
source("R/sendLinksToGraphDAG.R")
py_chess <- import("chess")
server <- function(input, output, session) {
  options(shiny.error = browser)
  chess <- py_chess$Board()
  lichess_state <- chess

  asciiBoard <- reactiveVal(capture.output(renderAsciiSummary(chess)))
  helperVisual <- reactiveVal(capture.output(fenMap(chess)))
  server_down_message <- readLines("server-down.txt", warn = FALSE)
  links <- reactiveVal({
    fen_string <- chess$fen()
    link_data <- getLinks(chess$fen())
    if (is.null(link_data)) {
      server_down_message
    } else {
      link_data
    }
  })
  fenDescription <- reactiveVal({
    fen_description(chess$fen(), verbose_ranks = TRUE) %>%
      as.yaml()
  })
  updateChessDependencies <- function() {
    asciiBoard(capture.output(renderAsciiSummary(chess)))
    helperVisual(capture.output(fenMap(chess)))
    links(getLinks(chess$fen()))
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
      verbatimTextOutput("revisualized")
    }
  })

  output$revisualized <- renderText({
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
          graph_text <- paste(sapply(links_data$edges, function(edge) paste(edge$source, edge$target, sep = "->")), collapse = "\n")
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
    data.frame(Number = 1:10, Letter = LETTERS[1:10])
  })

  # Plot for Plot View
  output$plotView <- renderPlot({
    data <- data.frame(x = 1:10, y = rnorm(10))
    ggplot(data, aes(x = x, y = y)) +
      geom_point() +
      geom_line() +
      theme_minimal() +
      labs(title = "Sample Plot", x = "Index", y = "Random Value")
  })
}
