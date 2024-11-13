# Planned Visuals
This document provides Ascii representations of planned Visual Features. Although this is an Ascii Chess application, it is a prototype that serves to assist in planning a more mature application. The Ascii visuals below help to outline the requirements for the visualization capabilities of the mature application.  

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
 8 |           ✱────✱         ✱────✱        |
   |        ⟋    ⟍ │  ⟍   ⟋ │       ⟍     |
 7 | ✱────✱         ✱────✱────✱         ✱   |
   |                  ⟍ │ ⟋     ⟍          |
 6 |                     ✱         ✱        |
   |                     │ ⟍    ⟋ │        |
 5 |                     ✱────✱────✱        |
   |                                        |
 4 |           ✱                            |
   |                                        |
 3 |                               ✱        |
   |                            ⟋  │ ⟍     |
 2 | ✱ ── ✱                   ✱────✱────✱   |
   | │ ⟋    ⟍                │    │  ⟋     |
 1 | ✱         ✱              ✱────✱        |
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
```

### FEN Map

The FEN map should look something like this:
```text
FEN : rnbqkbnr/pp2pppp/2p5/3p4/P6P/5N2/1PPPPPP1/RNBQKB1R b KQkq h3 0 3
♜_a8: ♜                                                              
♞_b8: └♞                                                              
♝_c8:   ♝
♛_d8:   │♛
♚_e8:   ││♚
♝_f8:   │││♝
♞_g8:   ││││♞
♜_h8:   │││││♜
-----   ││││││                                                       
♟︎_a7:   └┼┼┼┼┼>♟︎
♟︎_b7:    │││││  ♟︎
♟︎_e7:    └┼┼└┼>───♟︎
♟︎_f7:     └┼─┼>────♟︎
♟︎_g7:      └─┼>─────♟︎
♟︎_h7:        └>──────♟︎
-----
♟︎_c6:                   ♟︎
-----
♟︎_d5:                       ♟︎
-----
♙_a4:                          ♙
♙_h4:                          │ ♙              
-----                          │ │              
♘_f3:                          │ │  ♘           
-----                          │ │              
♙_b2:                          │ │      ♙       
♙_c2:                          │ │       ♙      
♙_d2:                          │ │        ♙     
♙_e2:                          │ │        │♙    
♙_f2:                          │ │        ││♙   
♙_g2:                          │ │        ││ ♙  
-----                          │ │        ││ │  
♖_a1:                          └─│────────││─│<─♖ 
♘_b1:                            │        └│─│<──♘
♗_c1:                            │        └│─│<───♗
♕_d1:                            │        └│─│<───└♕
♔_e1:                            │        └│─│<────└♔
♗_f1:                            │         └─└<─────└♗
♖_h1:                            └────────────<──────└─♖
FEN : rnbqkbnr/pp2pppp/2p5/3p4/P6P/5N2/1PPPPPP1/RNBQKB1R b KQkq h3 0 3
```


# Design Implications

This requires a visualization library with the following capabilities:  

 - node coordinates can be specified
 - edges can be declared as node-to-node relationships
 - edges will be drawn between nodes using straight lines
 - trees can be drawn with full and dotted lines
 - links between branches and leaves of trees can be drawn
 - nodes can have specified shapes and colors
 - nodes can be bidirectional, unidirectional, nor with no direction specified
 - square-based edges with specifiable paths
 - distinguishable overlapping edges

The chess analysis required is somewhat unusual:  

 - Discovering threats, protections, and other moves by the inactive player
 - Discoverying protections by both players, challenging because they are not covered by legal moves
 - Discovering geometrically adjacent pieces even if they do not threaten or protect each other
