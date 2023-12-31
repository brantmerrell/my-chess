# AsciiChessCS

AsciiChessCS is the C# prototype for an Ascii Chess Application. 

## Getting Started

To run AsciiChessCS, .NET must be installed. From the AsciiChessCS directory, run:  

```bash
dotnet run
```

Then visit `http://localhost:5204` to interact with the interface.  

## Interface Overview

The interface consists of three sections. From top to bottom, they are as follows:  

 1. **FEN**: A box and button to edit and submit FEN strings (see the [Wikipedia Page on FEN Strings](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation)).
 2. **Board**: An ASCII representation of a chessboard, showing pieces in theposition appropriate based on the submitted FEN string and moves.
 3. **Move**: A box and button to submit moves.

## Features:

### FEN Manipulation

The board starts out in the standard opening position, with the FEN box pre-populated with the standard opening FEN string: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`.  

The FEN string can be used to modify the position, the active player (whose move it is), castling eligibility, en passant eligibility, the move count, and the "halfmove clock." For example, to remove the white rook from h1, change the string's second capital R to 1 like so:  

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

### Move Manipulation
The input box allows you to type a move, then the "Submit Move" button will make that move on the chessboard.  

Note: Although submitting moves will change the Ascii Chess board, it will not change the FEN shown in the FEN input box. The FEN box and Submit FEN button provide the ability to reset the board to the desired position.  

## Missing Features: 

The following features are provided in other prototypes of this applicaiton and are TODOs for this prototype:  

 - **daily puzzles**: This feature provides a dropdown to select a daily puzzle from chess.com or lichess.org and populate the FEN box. A working example can be found in the R prototype of AsciiChess.
 - **Ascii FEN**: The Ascii chessboard should also have a FEN representation. This should be separate from the FEN Input box, which allows for reseting the board and choosing starting positions. A second FEN string should depict the board's current state. This can be seen in the R prototype of AsciiChess.
 - **Select Move**: Not supported by the Gera.Chess nuget package which this prototype uses. Options under consideration for adding it to the application include:
     * Submitting a change request to the Gera.Chess nuget package
     * Adding it as a helper method to the Ascii Chess CS prototype
     * Choosing a new chess package to support Ascii Chess CS
 - **Undo Move**: Not supported by the Gera.Chess nuget package which this prototype uses. There are two possible solutions: 
     * The ruby prototype of ascii chess solves a similar challenge by tracking a list of positions in a session.
     * Use a different package (there are many). I have not found one with an undo functionality that fits the lightweight needs of Ascii Chess.
 - **Redo Move**: The converse to the Undo Move feature. Likely requires tracking a list of positions in a session. 
 - **CSS Styling**: Currently uses the default styling of the razor framework.
 - **Error Handling**: Arguably not a *feature* but all the more a necessity. 

