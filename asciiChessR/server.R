library(httr)
library(reticulate)
library(magrittr)
source("chess_utils.R")
source("R/renderAsciiSummary.R")
source("R/globals.R")
source("R/fenMap.R")
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
  links <- reactiveVal(getLinks(chess$fen()))
  updateChessDependencies <- function() {
    asciiBoard(capture.output(renderAsciiSummary(chess)))
    helperVisual(capture.output(fenMap(chess)))
    links(getLinks(chess$fen()))
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

  # observeEvent(input$move, {
  # })

  #  observe({
  #    availableMoves <- getLegalMovesSan(chess$fen()) %>% sort()
  #    updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
  #  })
  output$board <- renderText({
    asciiBoard() %>%
      paste(collapse = "\n") %>%
      gsub(
        pattern = "\\.",
        replacement = " "
      )
  })

  output$revisualized <- renderText({
    if (input$selectedVisual == "Diagon Links") {
      graphdag_response <- sendLinksToGraphDAG(links())
      ascii_art <- paste(unlist(strsplit(graphdag_response[[1]], "\n")), collapse = "\n")
      if (!is.null(ascii_art) && nzchar(ascii_art)) {
        return(ascii_art)
      } else {
        return("No ASCII graph returned from the /graphdag endpoint.")
      }
    } else if (input$selectedVisual == "Link List") {
      graph_text <- paste(sapply(links()$edges, function(edge) paste(edge$source, edge$target, sep = "->")), collapse = "\n")
      return(graph_text)
    } else if (input$selectedVisual == "FEN map") {
      return(paste(helperVisual(), collapse = "\n"))
    } else {
      return("Select Helper Visual")
    }
  })
}
