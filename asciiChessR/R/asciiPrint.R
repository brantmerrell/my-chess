asciiPrint <- function(asciiLines) {
    borderLine <- "   +-------------------------------+" 
    cat(borderLine, "\n")  

    for (i in 1:length(asciiLines)) {
        # Create an empty line to be populated with characters and spaces
        spacedLine <- "" 

        for (j in 1:nchar(asciiLines[i])) {
            char <- substr(asciiLines[i], j, j) 
            spacedLine <- paste0(spacedLine, char, " ") 
        }

        cat(paste0(" ", 8 - i + 1, " | ", spacedLine, "|"), "\n")   
    }
    cat(borderLine, "\n")  
    cat("     a   b   c   d   e   f   g   h\n")
}

