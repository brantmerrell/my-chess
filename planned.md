# Planned Features
This list of planned features includes some that will be included in this prototype, but it primarily exists to guide the planning of a more mature application (perhaps one not so reliant on Ascii operations or sessions).  

## Lichess Integration

Integrate with the lichess API to access the following features:  

 - **Puzzle Training**: the puzzles chosen by lichess to match the logged-in user's skill level. This comes in two parts:
     * **Puzzle Viewing**: the ability to view the puzzle through the ascii app
     * **Puzzle Submission**: the ability to submit pieces to lichess for validation
 - **Featured Game Viewing**: view the games displayed at lichess.org/games. This comes in two parts:
     * **Game Selection**: the ability to view and select a list of games to watch
     * **Game Viewing**: the ability to view the game through the ascii app
 - **User Game Viewing**: the ability to view user's games on lichess.org. This includes:
     * **Current Game Selection**: the ability to see and select which games are currently being played
     * **Historical Game Selection**: the ability to see games which have been played
     * **Game Viewing**: the ability to browse through the moves of a game

## Chess.com Integration

Integrate with the chess.com API to access the following features:  

 - **Puzzle Training**: access the puzzles chosen by chess.com to match the logged-in user's skill level. This comes in two parts:
     * **Puzzle Viewing**: the ability to view the puzzle through the ascii app
     * **Puzzle Submission**: the ability to submit pieces to chess.com for validation

## Coordinate Location

Provide method for visualizing a square's location based on its location relative to the corners of its quadrant as well as the squares reflective along x, y, and x=y. For example, for `c6`, show:  
```text
   +------------------------+ 
 8 |            |           | 
 7 |            |           | 
 6 |       ⛿  ✱ |   ✱       | 
 5 |       ✱    |           | 
 4 |-----------             | 
 3 |       ✱        ✱       | 
 2 |                        | 
 1 |                        | 
   +------------------------+ 
     a  b  c  d  e  f  g  h 
```
This shows that c6 is:  

 - in the top-left quadrant
 - a 1x1 distance from the center of the board
 - vertically reflective to f6
 - horizontally reflective to c3
 - horizontally/vertically reflective to f3

For b6, the diagram should be:  
```text
   +------------------------+ 
 8 |            |           | 
 7 |            |           | 
 6 | ✱  ⛿       |      ✱    | 
 5 |    ✱       |           | 
 4 |-----------             | 
 3 |    ✱              ✱    | 
 2 |                        | 
 1 |                        | 
   +------------------------+ 
     a  b  c  d  e  f  g  h 
```
Which shows that b6 is: 
 - in the top-right quadrant
 - a 1x1 distance from the quadrant's bottom-left corner
 - vertically reflective to g6
 - horizontally reflective to b3
 - vertically/horizontally reflective to g3


## Diagonal Location

Provide method for visualizing a square's diagonal location in terms of vertical and horizontal distances. For example, for `c5`, show:  
```text
                          3 - 5 = -2
   +------------------------+    +------------------------+    +------------------------+ 
 8 |                ✱       |  8 |                      ✱ |  8 | ✱                      | 
 7 | ✱           ✱          |  7 |                   ✱    |  7 |    ✱                   | 
 6 |    ✱     ✱             |  6 |                ✱       |  6 |      |✱                | 
 5 |---3---✱                |  5 |       ✱-----✱          |  5 |      |✱--✱             |
 4 |    ✱  |  ✱             |  4 |       |  ✱             |  4 |             ✱          | 
 3 | ✱     5     ✱          |  3 |       ✱                |  3 |                ✱       | 
 2 |       |        ✱       |  2 |    ✱                   |  2 |                   ✱    | 
 1 |       |           ✱    |  1 | ✱                      |  1 |                      ✱ | 
   +------------------------+    +------------------------+    +------------------------+ 
     a  b  c  d  e  f  g  h        a  b  c  d  e  f  g  h        a  b  c  d  e  f  g  h  
                               3 + 5 = 8
```

## Diagonal Equations

Provide method for observing a diagonal based on a linear equation. Include list of any pieces on the diagonal. For example, given an empty board and the equation `file + rank = 8`, show:  
```text
   +------------------------+ 
 8 |                        | 
 7 | ✱                      | 
 6 |    ✱                   | 
 5 |       ✱                | 
 4 |          ✱             | 
 3 |             ✱          | 
 2 |                ✱       | 
 1 |                   ✱    | 
   +------------------------+ 
     a  b  c  d  e  f  g  h 
Pieces:
```

Or for given a standard setup and `file - rank = 1`:  
```text
   +------------------------+ 
 8 |                        | 
 7 |                      ✱ | 
 6 |                   ✱    | 
 5 |                ✱       | 
 4 |             ✱          | 
 3 |          ✱             | 
 2 |       ✱                | 
 1 |    ✱                   | 
   +------------------------+ 
     a  b  c  d  e  f  g  h 
Pieces: w[ Nb1 c2 ] b[ h7 ]
```

## Knight Trees
Construct a tree of possible destinations as well as a board with highlighted squares given a starting position, a FEN position, and N moves to make. Squares with friendly pieces require an extra move and are depicted with a broken branch. So given the starting FEN string of `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` which corresponds to the position  
```text
   +------------------------+ 
 8 | r  n  b  q  k  b  n  r | 
 7 | p  p  p  p  p  p  p  p | 
 6 |                        | 
 5 |                        | 
 4 |                        | 
 3 |                        | 
 2 | P  P  P  P  P  P  P  P | 
 1 | R  N  B  Q  K  B  N  R | 
   +------------------------+ 
     a  b  c  d  e  f  g  h   
```
If N = 1, the tree for Nb1 should look like this:  
```text
b1
 ├──a3
 ├──c3
 -
 └──d2
```
The highlighting should look like this:  
```text
   +------------------------+ 
 8 | r  n  b  q  k  b  n  r | 
 7 | p  p  p  p  p  p  p  p | 
 6 |                        | 
 5 |                        | 
 4 |                        | 
 3 | ✱     ✱                | 
 2 | P  P  P  P  P  P  P  P | 
 1 | R  N  B  Q  K  B  N  R | 
   +------------------------+ 
     a  b  c  d  e  f  g  h   
```
If N = 3, the tree and board should look like:
```text
b1
 ├──a3
 │   ├──c4
 │   │   ├──a5
 │   │   ├──b6
 │   │   ├──d6
 │   │   ├──e5
 │   │   ├──e3
 │   │   ├──a3
 │   │   
 │   │   ├──d2*
 │   │   └──b2*
 │   
 │   └──c2*
 ├──c3
 │   ├──a4
 │   │   ├──b6
 │   │   ├──c5
 │   │   
 │   │   └──b2*
 │   ├──d5
 │   │   ├──c7
 │   │   ├──e7
 │   │   ├──f6
 │   │   ├──f4
 │   │   ├──e3
 │   │   ├──b4
 │   │   └──b6
 │   ├──e4
 │   │   ├──d6
 │   │   ├──f6
 │   │   ├──g5
 │   │   ├──g3
 │   │   ├──d2*
 │   │   ├──c5
 │   │   
 │   │   └──f2*
 │   
 │   ├──a2*
 │   ├──e2*
 │   └──d1*
 ├──a3;c3
 │   └──b5
 │       ├──a7
 │       ├──c7
 │       ├──d6
 │       └──d4
 
 └──d2*
     ├──b3
     ├──e4
     ├──f3
     
     └──f1*

   +------------------------+ 
 8 | r  n  b  q  k  b  n  r | 
 7 | p✱ p  p✱ p  p✱ p  p  p | 
 6 |    ✱     ✱     ✱       | 
 5 | ✱     ✱     ✱     ✱    | 
 4 |    ✱  ✱  ✱  ✱  ✱       | 
 3 | ✱  ✱        ✱  ✱  ✱    | 
 2 | P✱ P  P  P  P✱ P  P  P | 
 1 | R  N  B  Q✱ K  B  N  R | 
   +------------------------+ 
     a  b  c  d  e  f  g  h   
```
Note that the pattern is thrown off by interrupted paths. For example, Nd2 is actually 2 moves away since it requires a friendly pawn to vacate d2, so b3, c4, e4, and f3 are 3 moves away even though they would be 2 moves away if the knight enjoyed an emptier board.  


## Board Shapes

Add shapes to remember board positions. For example, consider the following board:  
```text
   +------------------------+    +------------------------+ 
 8 |       r  q     r  k    |  8 |       ✱  ✱     ✱  ✱    | 
 7 | p  p     n  p  p     p |  7 | ✱  ✱     ✱  ✱  ✱     ✱ | 
 6 |             N     p    |  6 |             ✱     ✱    | 
 5 |             b  b  N    |  5 |             ✱  ✱  ✱    | 
 4 |       B                |  4 |       ✱                | 
 3 |                   Q    |  3 |                   ✱    | 
 2 | P  P           P  P  P |  2 | ✱  ✱           ✱  ✱  ✱ | 
 1 | n     B        R  K    |  1 | ✱     ✱        ✱  ✱    | 
   +------------------------+    +------------------------+ 
     a  b  c  d  e  f  g  h        a  b  c  d  e  f  g  h 
```
Convert to:  
```text
   +----------------------------------------+
 8 |           ✱ ⋯⋯ ✱         ✱ ⋯⋯ ✱        |
   |        ⋰⋰   ⋱⋱ ⋮ ⋱⋱   ⋰⋰ ⋮      ⋱⋱     |
 7 | ✱ ⋯⋯ ✱         ✱ ⋯⋯ ✱ ⋯⋯ ✱         ✱   |
   |                 ⋱⋱  ⋮ ⋰⋰   ⋱⋱          |
 6 |                     ✱         ✱        |
   |                     ⋮⋱⋱    ⋰⋰ ⋮        |
 5 |                     ✱ ⋯⋯ ✱ ⋯⋯ ✱        |
   |                                        |
 4 |           ✱                            |
   |                                        |
 3 |                               ✱        |
   |                            ⋰⋰ ⋮ ⋱⋱     |
 2 | ✱ ⋯⋯ ✱                   ✱ ⋯⋯ ✱ ⋯⋯ ✱   |
   | ⋮ ⋰⋰   ⋱⋱                ⋮ ⋱⋱ ⋮ ⋰⋰     |
 1 | ✱         ✱              ✱ ⋯⋯ ✱        |
   +----------------------------------------+
     a    b    c    d    e    f    g    h   
```

## Mobility Edges

Create Edges that correspond to threats and protections between pieces on the board. For example, given the following board:  

```text
   +------------------------+    +------------------------+ 
 8 |       r  q     r  k    |  8 |       ✱  ✱     ✱  ✱    | 
 7 | p  p     n  p  p     p |  7 | ✱  ✱     ✱  ✱  ✱     ✱ | 
 6 |             N     p    |  6 |             ✱     ✱    | 
 5 |             b  b  N    |  5 |             ✱  ✱  ✱    | 
 4 |       B                |  4 |       ✱                | 
 3 |                   Q    |  3 |                   ✱    | 
 2 | P  P           P  P  P |  2 | ✱  ✱           ✱  ✱  ✱ | 
 1 | n     B        R  K    |  1 | ✱     ✱        ✱  ✱    | 
   +------------------------+    +------------------------+ 
     a  b  c  d  e  f  g  h        a  b  c  d  e  f  g  h 
```
Convert to:  
```text
   +----------------------------------------+
 8 |           ✱ ←→ ✱   ← →   ✱ →  ✱        |
   |                ↓  ↘ →    ↓  ↙    ↘     |
 7 | ✱    ✱         ♞    ✱    ✱         ✱   |
   |                                  ↙     |
 6 |           ↓         ♘         ✱        |
   |                       ↖     ↙↗         |
 5 |                     ✱    ✱    ♘        |
   |                                        |
 4 |           ✱             ↖↘    ↑        |
   |                                        |
 3 |      ↙             ↗          ✱        |
   |                            ↙↗ ↕ ↖↘     |
 2 | ✱    ✱                   ✱ ⋯⋯ ✱ ⋯⋯ ✱   |
   |        ↖                 ↑ ↖  ↑  ↗     |
 1 | ✱         ✱              ✱ ⋯⋯ ✱        |
   +----------------------------------------+
     a    b    c    d    e    f    g    h   
``

