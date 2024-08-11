char_transpose <- function(vector_of_strings, reverse = F) {
  char_list <- strsplit(vector_of_strings, "")

  if (!reverse) {
    transposed_vector <- sapply(1:nchar(vector_of_strings[1]), function(i) {
      paste(sapply(char_list, `[`, i), collapse = "")
    })
  } else {
    transposed_vector <- sapply(1:nchar(vector_of_strings[1]), function(i) {
      paste(sapply(rev(char_list), `[`, i), collapse = "")
    })
  }

  return(transposed_vector)
}
