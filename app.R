library(shiny)
library(rchess)
library(magrittr)
library(shinythemes)

startFen <- "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"


ui <- fluidPage(
    theme = shinytheme("superhero"),
    tags$style(HTML("
      body {
          color: orange;
          margin-bottom: 200px;
      }
      body .my-split-layout #fen {
        width: 650px;
        background-color: pink;
      }
      body pre.shiny-text-output#board {
        width: 700px;
        background-color: lightblue;
      }
      body #selectedMove {
      }
      body #move {
        width: 100px;
      }
      body #submitMove {
        background-color: darkgreen;
      }
      body #undo {
        background-color: darkred;
      }
    ")),
    titlePanel("Ascii Chessboard"),
    
    verticalLayout(
        mainPanel(
            splitLayout(
                cellWidths = c("586px", "auto"),
                textInput("fen", NULL, startFen),
                actionButton("submitFEN", "Submit FEN"),
                cellArgs = list(
                    style = "vertical-align: top;"
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
        )
    )
)

server <- function(input, output, session) {

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

    # Reactive value to store the chessboard
    asciiBoard <- reactiveVal(capture.output(mySummary()))

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
            availableMoves <- chess$moves() %>% sort
            updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
        }
    })
    observeEvent(input$undo, {
        chess$undo()
        asciiBoard(capture.output(mySummary()))
        updateTextInput(session, "move", value = input$selectedMove)
        availableMoves <- chess$moves() %>% sort
        updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
    })

    observeEvent(input$selectedMove, {
        updateTextInput(session, "move", value = input$selectedMove)
    })

    observeEvent(input$move, {
        if(input$move != input$selectedMove) {
            updateSelectInput(session, "selectedMove", selected = "")
        }
    })

    observe({
        availableMoves <- chess$moves() %>% sort
        updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
    })

    output$board <- renderText({
        asciiBoard() %>% 
            paste(collapse = "\n") %>%
            gsub(pattern = "\\.", 
                 replacement = " ")
    })

}


shinyApp(ui, server, options=list(port=5679))

