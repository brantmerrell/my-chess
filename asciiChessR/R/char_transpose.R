char_transpose <- function(vector_of_strings) {
  char_list <- strsplit(vector_of_strings, "")

  transposed_vector <- sapply(1:nchar(vector_of_strings[1]), function(i) {
    paste(sapply(char_list, `[`, i), collapse = "")
  })

  return(transposed_vector)
}
