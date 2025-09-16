# Ascii Chess TS

Ascii Chess TS is a TypeScript-based chess visualization and analysis application with multiple viewing modes and comprehensive keyboard navigation.

## Getting Started

To run ascii-chess-ts, npm must be installed. Then from the ascii-chess-ts directory, run:

```bash
npm install
```

and

```bash
npm start
```

Then visit `http://localhost:3000` to interact with the interface.

## Interface Overview

The interface is organized into collapsible accordions for better organization:

### 1. **Appearance** (Toggle with 'r')
- **Positional View Selector** ('i'): Choose between Board, Graph, Arc, Chord, and GraphDAG views
- **Historical View Selector** ('o'): Switch between History table and Line chart (with metrics)
- **Piece View** ('p'): Toggle between Unicode symbols, Letters, or Asterisks
- **Connection Type** ('n'): Display different relationships (threats, adjacencies, king moves, none)
- **Theme Selector** ('t'): Choose color theme
- **Grid Toggle** ('w'): Show/hide coordinate grid in Graph view (with chess coordinates a-h, 1-8)

### 2. **Setup** (Toggle with 'e')
- **Position Selector** ('f'): Quick access to predefined positions and setups
- **FEN Input** ('F'): Edit and submit custom FEN strings (see the [Wikipedia Page on FEN Strings](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation))

### 3. **Main View Area** (Resizable with '+'/'-')
- **Left Panel**: Displays the selected positional view (Board, Graph, Arc, etc.)
- **Right Panel**: Shows historical data (move history or metrics chart with position indicator)

### 4. **Moves** (Toggle with 'v')
- **Navigation Controls**: Move through game history (backward/forward, jump to start/end)
- **Move Input** ('m'): Enter moves manually
- **Move Dropdown** ('c'): Select from available legal moves
- **Submit/Undo**: Execute or revert moves

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

The **"Moves" dropdown** allows the user to choose a move, and that move will populate the **Move input box**. The move has not yet been made because the **"Submit Move" button** has not been clicked.

The **Move input box** for a move can be manually edited or populated from the "Moves" dropdown to its left.

The **"Submit Move" button** will submit the move shown in the **Move input box** to the, and (if valid) this will be reflected on the Ascii Chess board.

The **"Undo Move" button** will undo the last move that was submitted.

**Note**: Although submitting and undoing moves will change the Ascii Chess board, it will not change the FEN shown in the FEN input box. The FEN box and Submit FEN button provide the ability to reset the board to the desired position.

## Keyboard Shortcuts

Press '?' to display the keyboard shortcuts panel, which includes:

### Navigation
- **h/l**: Move backward/forward through game history
- **^/$**: Jump to start/end of game
- **j/k**: Scroll down/up
- **u**: Undo last move (when at latest position)

### Focus Controls
- **f**: Focus position selector dropdown
- **F**: Focus FEN input field
- **m/M**: Focus move input field
- **c/C**: Focus move dropdown selector
- **i/I**: Focus positional view selector
- **o/O**: Focus historical view selector
- **p**: Focus piece view selector
- **n/N**: Focus connection type selector
- **t**: Focus theme selector

### Panel Controls
- **r/R**: Toggle Appearance accordion
- **e/E**: Toggle Setup accordion
- **v/V**: Toggle Moves accordion
- **w/W**: Toggle grid display (in Graph view)
- **+/-**: Increase/decrease main view height
- **?**: Show/hide keyboard shortcuts
- **Escape**: Unfocus current element

## Visualization Modes

### Positional Views
1. **Board View**: Traditional ASCII chess board representation
2. **Graph View**: Force-directed graph showing piece relationships with optional coordinate grid
3. **Arc View**: Arc diagram visualization of piece connections
4. **Chord View**: Circular chord diagram of piece interactions
5. **GraphDAG View**: Directed acyclic graph representation

### Historical Views
1. **History Table**: Complete move history with navigation
2. **Line Chart**: Real-time metrics including:
   - Piece counts for both sides
   - Mobility metrics
   - FEN string length
   - Current position indicator

## Advanced Features

- **Multiple Display Modes**: Unicode symbols, letter notation, or masked display
- **Connection Visualization**: View threats, protections, adjacencies, and king mobility
- **Theme Support**: Multiple color themes for better visibility
- **Position Library**: Pre-configured interesting positions and setups
- **Real-time Updates**: All views update instantly with moves
- **Coordinate Display**: Chess coordinates (a-h, 1-8) in Graph view

## Missing Features

The following features are planned for future updates:

- **Daily Puzzles**: Integration with chess.com or lichess.org daily puzzles
- **Current FEN Display**: Live FEN string showing current board state (separate from input)
- **Redo Move**: Forward navigation after undoing moves
- **Engine Analysis**: Chess engine integration for position evaluation
- **PGN Import/Export**: Load and save games in PGN format
- **Move Animations**: Smooth transitions between positions
