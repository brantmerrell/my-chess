# Ascii Chess R

Ascii Chess R is the R prototype for an Ascii Chess Application. A version of this prototype is deployed to a shiny server at (josh-b-merrell.shinyapps.io/my-chess)[https://josh-b-merrell.shinyapps.io/my-chess/].  

## Getting Started

To run asciiChessR, R must be installed as well as the following R packages:  

 - httr
 - shiny
 - rchess
 - magrittr
 - shinythemes

One way to install these packages is to run the following command:  
```bash
Rscript -e "install.packages(c('magrittr','shiny', 'remotes', 'reticulate', 'httr', 'shinythemes', 'igraph', 'yaml'))"
```

After installing R and the appropriate packages, run the following command from the prototype's root to start the application:  
```bash
Rscript -e 'library(shiny);runApp(port=5679)'
```
Then visit `http://localhost:5979` to interact with the interface.  

Code Style follows the default settings of the styler package. 

```bash
Rscript -e "library(styler); style_dir()"
```

## Interface Overview

The interface consists of four sections. From top to bottom, they are as follows:  

 1. **FEN**: A box and button to edit and submit FEN strings (see the [Wikipedia Page on FEN Strings](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation)).
 2. **Board**: An ASCII representation of a chessboard, showing pieces in theposition appropriate based on the submitted FEN string and moves.
 3. **Move**: A dropdown, box and buttons to select, submit, and undo moves.
 4. **Helper Visuals**: A dropdown to select a helper visual, currently providing "No Visual Selected" and "FEN Map" - which comes with a helper visual for FEN strings.

## Features:

### FEN Manipulation
The board starts out in the standard opening position, with the FEN box pre-populated with the standard opening FEN string: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`.  

The FEN dropdown allows a choice of options:  

 - **standard starting position**: the standard setup of a chess game
 - **daily lichess puzzle**: the daily puzzle provided by lichess.org
 - **daily chess.com puzzle**: the daily puzzle provided by chess.com

When a FEN is selected from the dropdown, it will populate the FEN input box. The FEN input box allows for additional modifications before clicking "Submit FEN". It can be used to modify the position, the active player (whose move it is), castling eligibility, en passant eligibility, the move count, and the "halfmove clock." For example, to remove the white rook from h1, change the string's second capital R to 1 like so:  
```text
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN1 w KQkq - 0 1
                                          ^
```

To give black the first move, change the `w` to `b` like so:  
```text
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNB b KQkq - 0 1
                                            ^
```
To switch sides, simply change all positional uppercase letters to lowercase and vice versa like so:
```text
RNBQKBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr w KQkq - 0 1
^^^^^^^^ ^^^^^^^^         ^^^^^^^^ ^^^^^^^^
```

### Ascii Board

The Ascii board consists of a FEN string, two boards arranged horizontally to each other, a specification of whose turn it is, a history of moves, and a set of current options to move. It looks something like this:  
```text
FEN: rnbqkbnr/pp2pppp/2p5/3p4/P6P/5N2/1PPPPPP1/RNBQKB1R b KQkq h3 0 3

Board:
   +------------------------+    +------------------------+
 8 | r  n  b  q  k  b  n  r |  8 | ✱  ✱  ✱  ✱  ✱  ✱  ✱  ✱ |
 7 | p  p        p  p  p  p |  7 | ✱  ✱        ✱  ✱  ✱  ✱ |
 6 |       p                |  6 |       ✱                |
 5 |          p             |  5 |          ✱             |
 4 | P                    P |  4 | ✱                    ✱ |
 3 |                N       |  3 |                ✱       |
 2 |    P  P  P  P  P  P    |  2 |    ✱  ✱  ✱  ✱  ✱  ✱    |
 1 | R  N  B  Q  K  B     R |  1 | ✱  ✱  ✱  ✱  ✱  ✱     ✱ |
   +------------------------+    +------------------------+
     a  b  c  d  e  f  g  h        a  b  c  d  e  f  g  h

Turn: Black

History: a4 d5 Nf3 c6 h4

Options to move:
a5 a6 b5 b6 Bd7 Be6 Bf5 Bg4 Bh3 c5 d4 e5 e6 f5 f6 g5 g6 h5 h6 Kd7 Na6 Nd7 Nf6 Nh6 Qa5 Qb6 Qc7 Qd6 Qd7
```
Note that this FEN string is not necessarily the same string as is shown in the FEN Input box above. The contents of the input box remain the same when moves are made, allowing the user to reset the position or prepare the next position. The FEN string depicted alongside the board allows the user to see the FEN representation of the board's current state.  

### Move Manipulation

The **"Moves" dropdown** allows the user to choose a move, and that move will populate the **Move input box**. The move has not yet been made because the **"Submit Move" button** has not been clicked.  

The **Move input box** for a move can be manually edited or populated from the "Moves" dropdown to its left.  

The **"Submit Move" button** will submit the move shown in the **Move input box** to the, and (if valid) this will be reflected on the Ascii Chess board.  

The **"Undo Move" button** will undo the last move that was submitted.  

### Helper Visual

The "Helper Visual" section features a dropdown to select methods to assist in visualizing the board. At present, only the "FEN Map" method is available for selection. Here is an example:  
```text
FEN : rnbqkbnr/pp2pppp/2p5/3p4/P6P/5N2/1PPPPPP1/RNBQKB1R b KQkq h3 0 3
♜_a8: ♜
♞_b8:  ♞
♝_c8:   ♝
♛_d8:    ♛
♚_e8:     ♚
♝_f8:      ♝
♞_g8:       ♞
♜_h8:        ♜
-----
♟︎_a7:          ♟︎
♟︎_b7:           ♟︎
♟︎_e7:             ♟︎
♟︎_f7:              ♟︎
♟︎_g7:               ♟︎
♟︎_h7:                ♟︎
-----
♟︎_c6:                   ♟︎
-----
♟︎_d5:                       ♟︎
-----
♙_a4:                          ♙
♙_h4:                            ♙
-----
♘_f3:                               ♘
-----
♙_b2:                                   ♙
♙_c2:                                    ♙
♙_d2:                                     ♙
♙_e2:                                      ♙
♙_f2:                                       ♙
♙_g2:                                        ♙
-----
♖_a1:                                           ♖
♘_b1:                                            ♘
♗_c1:                                             ♗
♕_d1:                                              ♕
♔_e1:                                               ♔
♗_f1:                                                ♗
♖_h1:                                                  ♖
FEN : rnbqkbnr/pp2pppp/2p5/3p4/P6P/5N2/1PPPPPP1/RNBQKB1R b KQkq h3 0 3
```
This assists in translating between FEN strings and board positions. The body of the map contains pieces which align vertically with their FEN representations and horizontally with their algebraic representations.  

