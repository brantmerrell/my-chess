
asciiSub <- function(patternAscii, replacementAscii, asciiLines) {
    asciiLines[2:10] <- gsub(asciiLines[2:10], pattern = patternAscii, replacement = replacementAscii)
    return(asciiLines)
}
