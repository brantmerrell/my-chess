fen_description <- function(fen, verbose_ranks = FALSE) {
  # Split FEN string by space to get fields
  fields <- strsplit(fen, " ")[[1]]
  names(fields) <- c("piece_placement", "active_color", "castling_availability", "en_passant_target_square", "halfmove_clock", "fullmove_number")

  # Split piece placement to get ranks
  ranks <- strsplit(fields["piece_placement"], "/")[[1]]
  names(ranks) <- c("rank_8", "rank_7", "rank_6", "rank_5", "rank_4", "rank_3", "rank_2", "rank_1")

  # Convert ranks to list and possibly expand them if verbose_ranks is TRUE
  if (verbose_ranks) {
    ranks <- lapply(ranks, function(rank) {
      extended_rank <- ""
      chars <- unlist(strsplit(rank, ""))
      for (char in chars) {
        if (grepl("^[[:digit:]]$", char)) {
          extended_rank <- paste0(extended_rank, paste0(rep("_", as.numeric(char)), collapse = ""))
        } else {
          extended_rank <- paste0(extended_rank, char)
        }
      }
      extended_rank
    })
  }

  # Create a nested structure for piece_placement with full and ranks
  piece_placement_details <- list(
    full = fields["piece_placement"],
    ranks = setNames(as.list(ranks), names(ranks))
  )

  # Construct the final list for YAML conversion
  description <- list(
    fen = fen,
    fields = list(
      piece_placement = piece_placement_details,
      active_color = fields["active_color"],
      castling_availability = fields["castling_availability"],
      en_passant_target_square = fields["en_passant_target_square"],
      halfmove_clock = fields["halfmove_clock"],
      fullmove_number = fields["fullmove_number"]
    )
  )

  return(description)
}
