library(shinythemes)
source("R/globals.R")
ui <- fluidPage(
    theme = shinytheme("superhero"),
    tags$link(rel = "stylesheet", type = "text/css", href = "styles.css"),
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
            selectInput("selectedVisual", NULL, c("No Visual Selected", "FEN map", "Link List", "Diagon Links"), selectize = FALSE),
            verbatimTextOutput("revisualized"),
        )
    )
)

