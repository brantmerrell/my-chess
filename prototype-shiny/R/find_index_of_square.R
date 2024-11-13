find_index_of_square <- function(fen, square) {
  # the file_index_of_rank function takes the same inputs
  rank_index <- find_index_of_rank(fen, square)

  # extract rank from square
  rank <- as.numeric(substr(square, 2, 2))

  # extract positional field from FEN
  position <- strsplit(fen, " ")[[1]][1]

  # split positional field into ranks
  ranks <- strsplit(position, "/")[[1]]

  # ranks are descending left-to-right,
  # so the rank string must increment from 8 to 1
  rank_string <- ranks[9 - rank]

  # use the helper function to find the file index
  file_index <- find_index_within_rank(rank_string, square)

  # return the sum of rank and file index
  return(rank_index + file_index)
}

# print(paste(find_index_of_square("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "c2"), "expect 29"))
# print(paste(find_index_of_square("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "c7"), "expect 12"))
