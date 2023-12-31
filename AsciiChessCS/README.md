# AsciiChessCS

AsciiChessCS is the C# prototype for an Ascii Chess Application. 

## Getting Started

To run AsciiChessCS, .NET must be installed. From the AsciiChessCS directory, run:  

```bash
dotnet run
```

Then visit `http://localhost:5204` to interact with the interface.  

## Interface Overview

The interface consists of a razor page with three sections. From top to bottom, they are as follows:  

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

## Missing Features: 

The following features are provided in other prototypes of this applicaiton and are TODOs for this prototype:  

 - **daily puzzles**: It would come with a dropdown to select a daily puzzle from chess.com or lichess.org and populate the FEN box.
 - **Undo Move**: Not supported by the Gera.Chess nuget package which this prototype uses. There are two possible solutions: 
     * The ruby prototype of ascii chess solves a similar challenge by tracking a list of positions in a session.
     * Use a different package (there are many). I have not found one with an undo functionality that fits the lightweight needs of Ascii Chess.
 - **Redo Move**: The converse to the Undo Move feature. Likely requires tracking a list of positions in a session. 
 - **CSS Styling**: Currently uses the default styling of the razor framework.
 - **Error Handling**: Arguably not a *feature* but all the more a necessity. 

