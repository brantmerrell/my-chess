shift_string <- function(index1, index2) {
  shift_length <- abs(index2 - index1)
  white_space <- paste0(rep(" ", min(index1, index2)-1), collapse = "")
  center <- paste0(rep("─", shift_length - 2), collapse = "")
  
  if (index2 > index1) {
      left_end <- "└"
      right_end <- "┐"
  } else {
      left_end <- "┌"
      right_end <- "┘"
  }

  return(paste0(c(white_space, left_end, right_end, center), collapse = ""))
}

