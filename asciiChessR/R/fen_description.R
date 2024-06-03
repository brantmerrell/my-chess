fen_description <- function(fen, verbose_ranks = FALSE) {
  # Split FEN string by space and assign to fields with names
  fields <- strsplit(fen, " ")[[1]]
  names(fields) <- c("piece_placement", "active_color", "castling_availability", "en_passant_target_square", "halfmove_clock", "fullmove_number")

  # Convert fields to list
  description <- list(fields = setNames(as.list(fields), names(fields)))

  # Split the piece placement field to get ranks, and assign names
  ranks <- strsplit(description$fields$piece_placement, "/")[[1]]
  names(ranks) <- c("rank_8", "rank_7", "rank_6", "rank_5", "rank_4", "rank_3", "rank_2", "rank_1")

  # Convert ranks to list
  description$ranks <- setNames(as.list(ranks), names(ranks))

  if (verbose_ranks) {
    # Extend each rank according to the number placeholders
    description$ranks <- lapply(description$ranks, function(rank) {
      extended_rank <- ""
      chars <- unlist(strsplit(rank, ""))
      for (char in chars) {
        if (grepl("^[[:digit:]]$", char)) {
          extended_rank <- paste0(extended_rank, paste0(rep("_", as.numeric(char)), collapse = ""))
        } else {
          extended_rank <- paste0(extended_rank, char)
        }
      }
      return(extended_rank)
    })
  }

  return(description)
}
