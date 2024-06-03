find_index_of_rank <- function(fen, square) {
  # rank will be 2nd character of square
  rank <- as.numeric(substr(square, 2, 2)) # 4

  # eighth rank always starts at index 0
  if (rank == 8) {
    return(0)
  }

  # positional field will be space-separated from other fields
  position <- strsplit(fen, " ")[[1]][1] # rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR

  # ranks will be separated from each other by forward-slashes
  ranks <- strsplit(position, "/")[[1]] # c('rnbqkbnr', 'pppppppp', '8', '8', '2P5', '8', 'PP1PPPPP', 'RNBQKBNR')

  # ranks are depicted top-to-bottom from left to right
  left_ranks <- ranks[1:(8 - rank)] # c('rnbqkbnr', 'pppppppp', '8', '8')


  return(
    sum(sapply(left_ranks, nchar)) + # character length of ranks
      length(left_ranks) # separators '/'
  )
}

# test cases
# print(paste(find_index_of_rank("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "c2"), "expect 26"))
# print(paste(find_index_of_rank("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "c4"), "expect 22"))
# print(paste(find_index_of_rank("rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1", "c4"), "expect 22")) # returns 24
# print(paste(find_index_of_rank("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "c7"), "expect 9"))
