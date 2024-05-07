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
py_chess <- import("chess")
server <- function(input, output, session) {

    chess <- py_chess$Board()
    liChessState <- chess

    asciiBoard <- reactiveVal(capture.output(mySummary(chess)))
    helperVisual <- reactiveVal(capture.output(helperSummary(chess)))

    observeEvent(input$selectedFEN, {
        updateTextInput(session, "fen", value = populateFEN(input$selectedFEN))
    })

    observeEvent(input$submitFEN, {
        fen_result <- tryCatch({
            chess$set_fen(input$fen)
        }, error = function(e) {
            FALSE
        })
        if (class(fen_result) == "logical") {
            showNotification("Invalid FEN. Please try again.")
        } else {
            if (input$selectedFEN == "lichess daily puzzle") {
                chess <<- liChessState
            }
            asciiBoard(capture.output(mySummary(chess)))
            helperVisual(capture.output(helperSummary(chess)))
            availableMoves <- getLegalMovesSan(chess$fen()) %>% sort
            updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
        }
    })

    observeEvent(input$submitMove, {
        move_result <- tryCatch({
            chess$push_san(input$move)
            TRUE
        }, error = function(e) {
            FALSE
        })

        if (!move_result) {
            showNotification("Invalid move. Please try again.")
        } else {
            asciiBoard(capture.output(mySummary(chess)))
            helperVisual(capture.output(helperSummary(chess)))
            availableMoves <- getLegalMovesSan(chess$fen()) %>% sort
            updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
        }
    })

    observeEvent(input$undo, {
        chess$pop()
        asciiBoard(capture.output(mySummary(chess)))
        helperVisual(capture.output(helperSummary(chess)))
        updateTextInput(session, "move", value = input$selectedMove)
        availableMoves <- getLegalMovesSan(chess$fen()) %>% sort
        updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
    })

    observeEvent(input$selectedMove, {
        updateTextInput(session, "move", value = input$selectedMove)
    })

    observeEvent(input$move, {
    })

    observe({
        availableMoves <- getLegalMovesSan(chess$fen()) %>% sort
        updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
    })

    output$board <- renderText({
        asciiBoard() %>% 
            paste(collapse = "\n") %>%
            gsub(pattern = "\\.",
                 replacement = " ")
    })

    output$revisualized <- renderText({
        if (input$selectedVisual == "FEN map") {
            helperVisual() %>%
                paste(collapse = "\n")
        } else {
            "Select Helper Visual"
        }
    })
}

