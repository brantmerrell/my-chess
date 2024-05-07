asciiSub <- function(patternAscii, replacementAscii, asciiLines) {
    asciiLines <- gsub(asciiLines, pattern = patternAscii, replacement = replacementAscii)
    return(asciiLines)
}
