# ASCII Chess

Ascii Chess and its prototypes explore the considerations of software design and user experience for a chess app to revisualize the chess board. This includes revisualizations such as:  

 - Clearing the board of distractions and clutter
     * Replacing squares with whitespace
     * Replacing pieces with letters
     * Replacing pieces with asterisks
     * Replacing positional depictions with FEN strings
 - Adding visuals to assist in seeing patterns
     * Demonstrating the relationship between diagonals and linear equations
     * Depicting the possible destinations of a knight given N moves
     * Connecting pieces to organize the board into chunks
     * Extending FEN strings into maps with connecting edges
     * Viewing moves by highlighting changes in FEN strings

This is as much about the revisualization of all topics as about the revisualization of chess. However, chess provides a clear method for testing the value of visualizations. Blindfold Chess in particular can indicate whether a visualization is useful.  

The visuals under design are listed in Visuals.md.  

This repository contains various prototypes of the ASCII Chess application. This enables comparison and contrast across different programming languages, frameworks, and libraries. It is not expected that the next level of maturity by the ASCII Chess project will limit itself to a single programming language as is the case with the prototypes.  

The following table provides the prototypes, their languages, web frameworks, and chess libraries:  
```text
┌─────────────┬────────┬─────────────┬─────────────┐
│Prototype    │Language│Web Framework│Chess Library│
├─────────────┼────────┼─────────────┼─────────────┤
│asciChessR   │R       │Shiny        │rchess       │
├─────────────┼────────┼─────────────┼─────────────┤
│asci-chess-ts│JS/TS   │React        │chess.js     │
├─────────────┼────────┼─────────────┼─────────────┤
│asci_chess_rb│Ruby    │Sinatra      │PGN          │
├─────────────┼────────┼─────────────┼─────────────┤
│AsciiChessCS │C#      │Blazor       │Gera.Chess   │
└─────────────┴────────┴─────────────┴─────────────┘
```

The comparison of features across chess libraries is tracked as follows:  
```text
┌────────────────┬──────┬────────┬───────┬───────────┐
│Feature         │rchess│chess.js│PGN(rb)│Chess(.NET)│
├────────────────┼──────┼────────┼───────┼───────────┤
│Board to FEN    │✓     │✓       │✕      │✓          │
├────────────────┼──────┼────────┼───────┼───────────┤
│Multi-Move      │✕     │✕       │✓      │✕          │
├────────────────┼──────┼────────┼───────┼───────────┤
│Legal moves list│✓     │✓       │✕      │✓          │
├────────────────┼──────┼────────┼───────┼───────────┤
│Undo move       │✓     │✓       │✕      │✕          │
└────────────────┴──────┴────────┴───────┴───────────┘
```
The comparison of features across prototypes is tracked in the following table:  

```text
┌─────────────────────────────┬───────────┬──────────────┬──────────────┬────────────┐
│Feature                      │asciiChessR│ascii-chess-ts│ascii_chess_rb│AsciiChessCS│
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Select Daily Lichess Puzzle  │✓          │✕             │✓             │✕           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Select Daily chess.com Puzzle│✓          │✕             │✕             │✕           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Edit FEN                     │✓          │✓             │✓             │✓           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Submit FEN                   │✓          │✓             │✓             │✓           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Current FEN state            │✓          │✕             │✕             │✕           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Ascii Board                  │✓          │✓             │✓             │✓           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Move History                 │✓          │✕             │✕             │✕           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Select Move                  │✓          │✓             │✕             │✓           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Edit Move                    │✓          │✓             │✓             │✓           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Undo Move                    │✓          │✓             │✓             │✕           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Redo Move                    │✕          │✕             │✓             │✕           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│Helper Visual Dropdown       │✓          │✕             │✕             │✕           │
├─────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│FEN Map                      │✓          │✕             │✕             │✕           │
└─────────────────────────────┴───────────┴──────────────┴──────────────┴────────────┘
```
Each prototype includes its own README.md explaining how to launch the application.  

