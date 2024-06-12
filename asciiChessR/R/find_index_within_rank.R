find_index_within_rank <- function(rank_string, square) {
  file_letter <- tolower(substr(square, 1, 1))

  target_file_number <- match(file_letter, letters)

  string_index <- 0
  board_index <- 0
  chars <- unlist(strsplit(rank_string, ""))

  for (char in chars) {
    string_index <- string_index + 1

    if (grepl("[1-8]", char)) {
      spaces <- as.numeric(char)
      if (board_index + spaces >= target_file_number) {
        return(string_index)
      }
      board_index <- board_index + spaces
    } else {
      board_index <- board_index + 1
      if (target_file_number == board_index) {
        return(string_index)
      }
    }
  }
  return(-1)
}
