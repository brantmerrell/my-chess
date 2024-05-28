library(httr)
library(reticulate)
library(magrittr)
source("getLegalMovesSan.R")
source("R/mySummary.R")
source("R/globals.R")
source("R/helperSummary.R")
source("R/populateFEN.R")
source("R/asciiPrint.R")
source("R/asciiSub.R")
source("getLinks.R")
source("sendLinksToGraphDAG.R")
py_chess <- import("chess")
server <- function(input, output, session) {
  chess <- py_chess$Board()
  lichess_state <- chess

  asciiBoard <- reactiveVal(capture.output(mySummary(chess)))
  helperVisual <- reactiveVal(capture.output(helperSummary(chess)))
  links <- reactiveVal(getLinks(chess$fen()))
  # Function to update all reactive values
  updateChessDependencies <- function() {
    asciiBoard(capture.output(mySummary(chess)))
    helperVisual(capture.output(helperSummary(chess)))
    links(getLinks(chess$fen())) # Update links
  }

  observeEvent(input$selectedFEN, {
    updateTextInput(session, "fen", value = populateFEN(input$selectedFEN))
  })

  observeEvent(input$submitFEN, {
    fen_result <- tryCatch(
      {
        chess$set_fen(input$fen)
      },
      error = function(e) {
        FALSE
      }
    )
    if (class(fen_result) == "logical") {
      showNotification("Invalid FEN. Please try again.")
    } else {
      if (input$selectedFEN == "lichess daily puzzle") {
        chess <<- lichess_state
      }
      updateChessDependencies() # Update all dependencies
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
      updateChessDependencies() # Update all dependencies
    }
  })

  observeEvent(input$undo, {
    chess$pop()
    updateChessDependencies() # Update all dependencies
  })

  observeEvent(input$selectedMove, {
    updateTextInput(session, "move", value = input$selectedMove)
  })

  observeEvent(input$move, {
  })

  observe({
    availableMoves <- getLegalMovesSan(chess$fen()) %>% sort()
    updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
  })

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
