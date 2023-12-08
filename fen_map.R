fen_map <- function(FEN, chess_symbol = FALSE, validate = FALSE) {
    result <- c()
    fen_to_symbol <- list(
        K = '♔', Q = '♕', R = '♖', B = '♗', N = '♘', P = '♙', 
        k = '♚', q = '♛', r = '♜', b = '♝', n = '♞', p = '♟︎'
    )
    sq_files <- list(
        '1' = 'a', '2' = 'b', '3' = 'c', '4' = 'd', 
        '5' = 'e', '6' = 'f', '7' = 'g', '8' = 'h'
    )
    sq_file <- 1
    sq_rank <- 8
    fen_length <- 0

    # Optional: Add FEN validation logic here (if required)

    # Process the FEN string
    FEN_split <- strsplit(FEN, "")[[1]]

    for (char in FEN_split) {
        fen_length <- fen_length + 1
        if (char == " ") {
            break
        } else if (grepl("[0-9]", char)) {
            sq_file <- sq_file + as.numeric(char)
        } else if (char == "/") {
            sq_file <- 1
            sq_rank <- sq_rank - 1
            result <- c(result, paste0("----- ", paste0(rep(" ", nchar(FEN)), collapse = "")))
        } else {
            if (chess_symbol && char %in% names(fen_to_symbol)) {
                char <- fen_to_symbol[[char]]
            }
            result_row <- paste0(char, "_", sq_files[[as.character(sq_file)]], sq_rank)
            result_row <- paste0(result_row, ':', paste0(rep(" ", fen_length), collapse = ""), char)
            result_row <- paste(result_row, paste0(rep(" ", nchar(FEN) - nchar(result_row) + 5), collapse = ""))
            result <- c(result, result_row)
            sq_file <- sq_file + 1
        }
    }
    result <- c(
            paste0("FEN : ", FEN),
            result,
            paste0("FEN : ", FEN)
        )
    return(result)
}
