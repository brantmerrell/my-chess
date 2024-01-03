This repository contains distinct prototypes of an ASCII Chess application. This enables comparison and contrast across different programming languages, frameworks, and libraries, all aimed at providing helper visuals for chess players. The following table provides the prototypes, their languages, web frameworks, and chess libraries:  
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

To understand the goals and desired enhancements for these prototypes, please refer to the following markdown files:

 - **Integrations.md** - Details on the intended integrations with chess.com and lichess.org.
 - **Visuals.md** - Descriptions of the desired dynamic visual representations for games, positions, squares, and pieces.
 - **TechnicalDiscussion.md** - Compares and contrasts libraries and frameworks given the goals of the ASCII Chess application.

