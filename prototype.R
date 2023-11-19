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
      }
      body .my-split-layout #fen {
        width: 650px;
        background-color: pink;
      }
      body pre.shiny-text-output#board {
        width: 700px;
        background-color: lightblue;
      }
      body #move {
          background-color: pink;
      }
      body #submitMove {
          background-color: darkgreen;
          color: white;
      }
      body #undo {
          background-color: darkred;
          color: white;
      }
    ")),
    titlePanel("Ascii Chessboard"),
    
    verticalLayout(
        mainPanel(
            splitLayout(
                cellWidths = c("569px", "auto"),
                textInput("fen", NULL, startFen),
                actionButton("submitFEN", "Submit FEN"),
                cellArgs = list(
                    style = "vertical-align: top;"
                ),
                class = "my-split-layout"
            ),
            verbatimTextOutput("board"),
            splitLayout(
                textInput("move", NULL, ""),
                actionButton("submitMove", "Submit Move"),
                actionButton("undo", "Undo Move"),
            ),
        )
    )
)

server <- function(input, output, session) {

    # Initialize the chess object
    chess <- Chess$new()

    # Reactive value to store the chessboard
    asciiBoard <- reactiveVal(c(
                                capture.output(chess$print()), 
                                "\n",
                                capture.output(chess$moves())
                                )
    )

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
            asciiBoard(c(
                         capture.output(chess$print()),
                         "\n",
                         capture.output(chess$moves())))
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
            asciiBoard(c(
                         capture.output(chess$print()),
                         "\n",
                         capture.output(chess$moves())
                         ))
        }
    })
    observeEvent(input$undo, {
        chess$undo()
        asciiBoard(c(
                     capture.output(chess$print()),
                     "\n",
                     capture.output(chess$moves())
                     ))
    })

    output$board <- renderText({
        asciiBoard() %>% 
            paste(collapse = "\n") %>%
            gsub(pattern = "\\.", 
                 replacement = " ")
    })

}


shinyApp(ui, server, options=list(port=5679))

