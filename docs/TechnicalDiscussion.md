# Technical Discussion
This document compares and contrasts libraries and frameworks across the prototypes listed below based on the goals of the ASCII Chess application.  
```csv
Prototype,Language,Web Framework,Chess Library
asciChessR,R,Shiny,rchess
asci-chess-ts,JavaScript/TypeScript,React,chess.js
asci_chess_rb,Ruby,Sinatra,PGN
AsciiChessCS,C#,Blazor,Gera.Chess
```

## Chess Libraries
Efforts were made to select chess libraries which closely resemble each other, and all selected libraries provide the following features:  

 - Print Ascii Board - print an Ascii representation of a board
 - FEN to Board - set up a board by providing a FEN string
 - Single Move - modify a board by making a single move* (or add a position to a game in the case of ruby gem PGN)  

There were also features which were offered by some libraries but not others, and therefore impacted the differences between prototypes:

```text
┌────────────────┬──────┬────────┬───────┬───────────┬────────────────────────────────────────────────────────────┐
│Feature         │rchess│chess.js│PGN(rb)│Chess(.NET)│impact                                                      │
├────────────────┼──────┼────────┼───────┼───────────┼────────────────────────────────────────────────────────────┤
│Board to FEN    │✓     │✓       │✕      │✓          │FEN display omitted from AsciiChessCS                       │
├────────────────┼──────┼────────┼───────┼───────────┼────────────────────────────────────────────────────────────┤
│Multi Move      │✕     │✕       │✓      │✕          │no need to explicitly iterate through moves in asci_chess_rb│
├────────────────┼──────┼────────┼───────┼───────────┼────────────────────────────────────────────────────────────┤
│Legal moves list│✓     │✓       │✕      │✓          │dropdown of moves omitted from asci_chess_rb                │
├────────────────┼──────┼────────┼───────┼───────────┼────────────────────────────────────────────────────────────┤
│Undo move       │✓     │✓       │✕      │✕          │undo functionality omitted from AsciiChessCS                │
└────────────────┴──────┴────────┴───────┴───────────┴────────────────────────────────────────────────────────────┘
```
Note that although "Undo move" is not offered by the ruby chess library (PGN) or the .NET chess library (Gera.Chess), it is not omitted from the ruby prototype (asci_chess_rb). Ruby's PGN library defines a game object as a list of positions, and the current position is an index that points to a position in the list. Rather than being explicitly built-in as methods, "Undo" and "Redo" are a simple matter of changing this index.  

There are also desired features which are not offered by any chess libraries and must be provided by state management, helper method, or other design approaches:  

**Inactive Color moves**  

The active color is the player whose turn it is, while the inactive color is the opposite. The inactive color's options play a key role in the active player's decision-making process, but its meaning is fuzzy. The options they had when choosing their previous move are not necessarily the same as the options they will have when choosing their next move. It makes sense that software libraries do not provide this as an option.  

However, many of the goals of this application delve into concepts such as the inactive color's options. For example, some of the visual plans involve drawing edges between pieces that protect each other whether they're the active or inactive color. Visualizing tactical opportunities can mean demonstrating concepts like discovered check or x-ray attack regardless of who the active player is. This isn't supposed to be covered by exhaustively walking through possibilities, it's supposed to help users first see the visuals and then imagine the visuals on their own.  

Given that no existing libraries provide or ought to provide this functionality, this application must accommodate this requirement in its design considerations. For example, create a helper function that switches the active color and returns all legal moves, and finds some way to convey confounding circumstances like checks and pins.  

**Protection Edges**  

I do not know of a good word for "Protection Edges" - certainly not the phrase I have settled on using. However, this derives from viewing the chess pieces as nodes and their relationships as edges, similar to the vocabulary of a network map. The edges between opposite colors would be "Threat Edges" (or even just "Threats"), while the edges between the same color would be "Protection Edges".  

The reason no chess library provides these is because there's no such thing as a "Protection Edge" that shows up in a list of legal moves. By virtue of being "Protection" relationships, making a move that corresponds to one of these edges would capture a piece of the same color.  

Although there are cleverer ways to accommodate this requirement, the following steps illustrate the difficulty of providing this feature by relying on a standard chess package:  

 1. Initialize an empty list of Protection Edges
 2. For each active piece except the king,
     a. Remove the piece from the board.
     b. For each other active piece,
         i. Check whether it can move to the vacated square
         ii. If so, define a directional edge and add to the list
     c. Return the piece to its location
 3. Swap the "active color"
 4. Repeat step 2 alongside substeps
 5. Return board to its original state

**Redo Move**
After undoing a move, redo the move. It makes sense that this is not in a chess library as its use cases are context-dependent and should generally be handled by the application that relies on the chess library rather than the library itself.  

## Web Frameworks

## Ascii-Chess Prototypes
