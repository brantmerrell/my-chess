find_index_within_rank <- function(rank_string, square) { 

    # file letter will be first character of square
    file_letter <- tolower(substr(square, 1, 1))

    # convert file letter to file number
    target_file_number <- match(file_letter, letters)

    # initialize string and board indices at 0
    string_index <- 0
    board_index <- 0
    # split rank string into characters
    chars <- unlist(strsplit(rank_string, ""))

    # iterate through characters
    for (char in chars) {
        # string index increments by 1 whether character is a letter or a string
        string_index <- string_index + 1

        # if character is a number,
        if (grepl("[1-8]", char)) { 
            # store it as spaces to indicate a count of empty spaces
            spaces = as.numeric(char)
            # if empty spaces count exceeds or equals target file number,
            if (board_index + spaces >= target_file_number) { 
                # then the square shares an index with the empty spaces
                return(string_index) 
            }
            # otherwise continue incrementing board index
            board_index <- board_index + spaces
        } else { # if character is a letter
            # it contributes 1 character to the FEN index
            board_index <- board_index + 1 
            # if this brings the board index to the same as the target file number, 
            if (target_file_number == board_index) { 
                # this is the string index 
                return(string_index)  
            }
        }
    }
    return(-1)
}

# test cases
print(paste(find_index_within_rank("8", "c1"), "expect 1"))
print(paste(find_index_within_rank("8", "c8"), "expect 1"))
print(paste(find_index_within_rank("PPPP4", "c8"), "expect 3"))
print(paste(find_index_within_rank("2P5", "c4"), "expect 2"))
