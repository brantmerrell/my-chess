library(httr)
library(reticulate)
library(magrittr)
source("getLegalMovesSan.R")
source("R/mySummary.R")
source("R/globals.R")
source("R/helperSummary.R")
source("R/populateFEN.R")
source("R/asciiPrint.R")
source("R/asciiSub.R")
source("getLinks.R")
source("sendLinksToGraphDAG.R")
py_chess <- import("chess")

chess <- py_chess$Board()
links <- getLinks(chess$fen())

print("links:")
print(links)
graphdag_response <- sendLinksToGraphDAG(links)
ascii_art <- paste(unlist(strsplit(graphdag_response[[1]], "\n")), collapse = "\n")
for (l in ascii_art) {
  cat(l, "\n")
}
