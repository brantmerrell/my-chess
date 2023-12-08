library(httr)
library(shiny)
library(rchess)
library(magrittr)
library(shinythemes)


chessComPuzzle <- "https://api.chess.com/pub/puzzle"
startFen <- "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
source("fen_map.R")

ui <- fluidPage(
    theme = shinytheme("superhero"),
    tags$style(HTML("
      body {
          color: orange;
          margin-bottom: 50px;
      }
      body #selectedFEN {
        width: 587px;
        border-radius: 5px;
      }
      body .my-split-layout #fen {
        width: 650px;
        border-radius: 5px;
      }
      body pre.shiny-text-output#board {
        width: 700px;
        background-color: lightblue;
        border-radius: 5px;
      }
      body pre.shiny-text-output#revisualized {
        width: 700px;
        background-color: lightblue;
        border-radius: 5px;
      }
      body #selectedMove {
        border-radius: 5px;
      }
      body #move {
        width: 100px;
        border-radius: 5px;
      }
      body #submitMove {
        background-color: darkgreen;
        border-radius: 5px;
      }
      body #undo {
        background-color: darkred;
        border-radius: 5px;
      }
      body #selectedVisual {
        border-radius: 5px;
      }
    ")),
    titlePanel("Ascii Chessboard"),
    
    verticalLayout(
        mainPanel(
            selectInput("selectedFEN", NULL, c("standard starting position", "chess.com daily puzzle"), selectize = FALSE),
            splitLayout(
                cellWidths = c("586px", "auto"),
                textInput("fen", NULL, startFen),
                actionButton("submitFEN", "Submit FEN"),
                cellArgs = list(
                    style = "vertical-align: top; border-radius: 5px;"
                ),
                class = "my-split-layout"
            ),
            verbatimTextOutput("board"),
            splitLayout(
                cellWidths = c("130px", "130px", "130px", "130px"),
                cellArgs = list(
                    style = "vertical-align: top; overflow: visible;"
                ),
                selectInput("selectedMove", NULL, "", width = "100px", selectize = FALSE),
                textInput("move", NULL, ""),
                actionButton("submitMove", "Submit Move"),
                actionButton("undo", "Undo Move"),
                class = "my-split-layout"
            ),
            h3("Helper Visual"),
            selectInput("selectedVisual", NULL, c("No Visual Selected", "FEN map"), selectize = FALSE),
            verbatimTextOutput("revisualized"),
        )
    )
)

server <- function(input, output, session) {

    populateFEN <- function(opt) {
        if (opt == "standard starting position") {
            return(startFen)
        }
        if (opt == "chess.com daily puzzle") {
            puzzle <- GET(chessComPuzzle) %>%
                content() %>%
                .$fen
            return(puzzle)
        }
        opt
    }

    # Initialize the chess object
    chess <- Chess$new()
    mySummary <- function() {
        cat(paste("FEN:", chess$fen(), "\n"))
        cat("\nBoard:\n")
        cat(chess$ascii())
        cat(paste("\nTurn:", ifelse(chess$turn() == "w", "White", "Black"), "\n"))
        cat("\n")
        cat(paste(c("\nHistory:", chess$history(), "\n")))
        cat("\nOptions to move:\n")
        cat(chess$moves() %>% sort())
    }
    helperSummary <- function() {
        x <- fen_map(chess$fen())
        for (l in x) {
            cat(l, "\n")
        }
    }

    # Reactive value
    asciiBoard <- reactiveVal(capture.output(mySummary()))
    helperVisual <- reactiveVal(capture.output(helperSummary()))
    #revisualizedBoard <- reactiveVal()

    observeEvent(input$selectedFEN, {
        updateTextInput(session, "fen", value = populateFEN(input$selectedFEN))
    })

    # Function to render chessboard based on FEN submission
    observeEvent(input$submitFEN, {
        # Use tryCatch to handle errors
        fen_result <- tryCatch({
            chess$load(input$fen)
        }, error = function(e) {
            FALSE
        })
        if (!fen_result) {
            showNotification("Invalid FEN. Please try again.")
        } else {
            # Update the reactive values to reflect the new state
            asciiBoard(capture.output(mySummary()))
            helperVisual(capture.output(helperSummary()))
            #revisualizedBoard(capture.output(visualSwitch()))
            availableMoves <- chess$moves() %>% sort
            updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
        }
    })


    # Function to render chessboard based on move submission
    observeEvent(input$submitMove, {
        # Use tryCatch to handle errors
        move_result <- tryCatch({
            chess$move(input$move)
            TRUE
        }, error = function(e) {
            FALSE
        })

        if (!move_result) {
            showNotification("Invalid move. Please try again.")
        } else {
            # Update the reactive values to reflect the new state
            asciiBoard(capture.output(mySummary()))
            helperVisual(capture.output(helperSummary()))
            #revisualizedBoard(capture.output(visualSwitch()))
            availableMoves <- chess$moves() %>% sort
            updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
        }
    })
    observeEvent(input$undo, {
        chess$undo()
        asciiBoard(capture.output(mySummary()))
        helperVisual(capture.output(helperSummary()))
        #revisualizedBoard(capture.output(visualSwitch()))
        updateTextInput(session, "move", value = input$selectedMove)
        availableMoves <- chess$moves() %>% sort
        updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
    })

    observeEvent(input$selectedMove, {
        updateTextInput(session, "move", value = input$selectedMove)
    })


    observeEvent(input$move, {
    })

    observe({
        availableMoves <- chess$moves() %>% sort
        updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
    })
    #observe({
    #    # Capture the output as a character vector, ensuring newline characters are respected
    #    revisualizedOutput <- capture.output(visualSwitch())
    #    # Combine the vector into a single string, separating elements with a newline
    #    combinedOutput <- paste(revisualizedOutput, collapse = "\n")
    #    revisualizedBoard(combinedOutput)
    #})

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


shinyApp(ui, server, options=list(port=5679))

