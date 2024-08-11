library(magrittr)
library(stringr)
source("R/globals.R")
source("R/char_transpose.R")

fen_map <- function(FEN, connections, chess_symbol = TRUE, validate = FALSE) {
  get_position <- function(file, rank) {
    paste0(letters[file], rank)
  }

  result <- c()
  sq_file <- 1
  sq_rank <- 8
  fen_length <- 0

  FEN_split <- strsplit(FEN, "")[[1]]

  position_symbol <- list()

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
        char <- intToUtf8(utf8ToInt(char)[1])
      }
      pos <- get_position(sq_file, sq_rank)
      position_symbol[[pos]] <- char

      result_row <- paste0(char, "_", pos)
      result_row <- paste0(result_row, ":", paste0(rep(" ", fen_length), collapse = ""), char)
      to_add <- nchar(FEN) - nchar(result_row) + 6
      if (to_add > 0) {
        result_row <- paste0(result_row, paste0(rep(" ", to_add), collapse = ""))
      }
      result <- c(result, result_row)
      sq_file <- sq_file + 1
    }
  }

  for (conn in 1:nrow(connections)) {
    from_pos <- connections$source[conn]
    to_pos <- connections$target[conn]
    type <- connections$type[conn]

    from_index <- find_index_of_square(FEN, from_pos)
    to_index <- find_index_of_square(FEN, to_pos)

    if (type == "protection") {
      x <- min(from_index, to_index)
      y <- FEN %>%
        substr(start = 1, stop = max(from_index, to_index)) %>%
        gsub(pattern = "\\d", replacement = "") %>%
        nchar()

      result_row <- result[y]
      insert_pos <- x + 6
      result_row <- substr(result_row, 1, insert_pos - 1)
      result_row <- paste0(result_row, "└")
      result_row <- paste0(result_row, substr(result[y], insert_pos + 1, nchar(result[y])))
      result_row <- str_replace_all(result_row, "(?<=└) +(?=[^ ])", function(match) {
        gsub(" ", "─", match)
      })
      result[y] <- result_row
    } else if (type == "threat") {
      x <- max(from_index, to_index)
      y <- FEN %>%
        substr(start = 1, stop = min(from_index, to_index)) %>%
        gsub(pattern = "\\d", replacement = "") %>%
        nchar()

      result_row <- result[y]
      insert_pos <- x + 6
      result_row <- substr(result_row, 1, insert_pos - 1)
      result_row <- paste0(result_row, "┐")
      result_row <- paste0(result_row, substr(result[y], insert_pos + 1, nchar(result[y])))
      result_row <- str_replace_all(result_row, "(?<=[^ ]) +(?=┐)", function(match) {
        gsub(" ", "─", match)
      })
      result[y] <- result_row
    }
  }
  result <- char_transpose(result)
  result <- str_replace_all(result, "(?<=[♟♞♝♜♛♚♙♘♗♖♕♔]).+(?=└)", function(match) {
    gsub("[ ─]", "│", match)
  })
  result <- str_replace_all(result, "(?<=┐).+(?=[♟♞♝♜♛♚♙♘♗♖♕♔])", function(match) {
    gsub("[ ─]", "│", match)
  })
  result <- char_transpose(result)
  result <- c(
    paste0("FEN : ", FEN),
    result,
    paste0("FEN : ", FEN)
  )
  return(result)
}
