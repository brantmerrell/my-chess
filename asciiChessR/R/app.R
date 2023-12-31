library(httr)
library(shiny)
library(rchess)
library(magrittr)
library(shinythemes)
source("mySummary.R")
source("fen_map.R")

startFen <- "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

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
        white-space: pre-wrap;
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
            selectInput("selectedFEN", NULL, c("standard starting position", "lichess daily puzzle", "chess.com daily puzzle"), selectize = FALSE),
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

    chess <- Chess$new()
    liChessState <- chess$clone()

    populateFEN <- function(opt) {
        chessComPuzzle <- "https://api.chess.com/pub/puzzle"
        liChessPuzzle <- "https://lichess.org/api/puzzle/daily"
        if (opt == "standard starting position") {
            return(startFen)
        }
        if (opt == "lichess daily puzzle") {
            content <- GET(liChessPuzzle) %>%
                content()
            if (is.null(content)) {
                showNotification("Error retrieving puzzle. Defaulting to standard starting position.")
                puzzle <- startFen
            }
            pgn <- strsplit(content$game$pgn," ")[[1]]
            initialPly <- content$puzzle$initialPly
            game <- Chess$new()
            for (move in pgn[1:(initialPly+1)]) {
                game$move(move)
            }
            liChessState <<- game
            return(game$fen())
        }
        if (opt == "chess.com daily puzzle") {
            tryCatch ({
                puzzle <- GET(chessComPuzzle) %>%
                    content() %>%
                    .$fen
            }, error = function(e) {
                showNotification("Error retrieving puzzle. Defaulting to standard starting position.")
                puzzle <- startFen
            }) 
            if (is.null(puzzle)) {
                showNotification("Error retrieving puzzle. Defaulting to standard starting position.")
                puzzle <- startFen
            }
            return(puzzle)
        }
        opt
    }

    helperSummary <- function() {
        x <- fen_map(chess$fen())
        for (l in x) {
            cat(l, "\n")
        }
    }

    asciiBoard <- reactiveVal(capture.output(mySummary(chess)))
    helperVisual <- reactiveVal(capture.output(helperSummary()))

    observeEvent(input$selectedFEN, {
        updateTextInput(session, "fen", value = populateFEN(input$selectedFEN))
    })

    observeEvent(input$submitFEN, {
        fen_result <- tryCatch({
            chess$load(input$fen)
        }, error = function(e) {
            FALSE
        })
        if (!fen_result) {
            showNotification("Invalid FEN. Please try again.")
        } else {
            if (input$selectedFEN == "lichess daily puzzle") {
                chess <<- liChessState
            }
            asciiBoard(capture.output(mySummary(chess)))
            helperVisual(capture.output(helperSummary()))
            availableMoves <- chess$moves() %>% sort
            updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
        }
    })

    observeEvent(input$submitMove, {
        move_result <- tryCatch({
            chess$move(input$move)
            TRUE
        }, error = function(e) {
            FALSE
        })

        if (!move_result) {
            showNotification("Invalid move. Please try again.")
        } else {
            asciiBoard(capture.output(mySummary(chess)))
            helperVisual(capture.output(helperSummary()))
            availableMoves <- chess$moves() %>% sort
            updateSelectInput(session, "selectedMove", choices = c("", availableMoves))
        }
    })

    observeEvent(input$undo, {
        chess$undo()
        asciiBoard(capture.output(mySummary(chess)))
        helperVisual(capture.output(helperSummary()))
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

