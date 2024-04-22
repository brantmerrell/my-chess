    import { createSlice } from '@reduxjs/toolkit';
    import { ChessGame } from '../../chess/chessGame';
    
    export interface ChessGameState {
        fen: string;
        moves: string[];
        history: string[];
    }
    const initialGameState: ChessGameState = {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', //Starting position
        moves: [],
        history: [],
    }
    export const chessGameSlice = createSlice({
      name: 'chessGame',
      initialState: initialGameState,
      reducers: {
        loadFen(state, action) {
          try {
             const newGame = new ChessGame(action.payload);
             state.fen = action.payload;
             state.moves = newGame.getMoves();
             state.history = []; // Reset history with new FEN
           } catch (error) {
             console.error('Invalid FEN string');
           }
        },
        makeMove(state, action) {
          try {
              const newGame = new ChessGame(state.fen); // Create from current state
              newGame.makeMove(action.payload);
              state.fen = newGame.toFen();  
              state.moves = newGame.getMoves();
              state.history.push(action.payload);  // Store move for history
          } catch (error) {
              console.error('Error submitting move');
          }
        },
        undoMove(state) {
          if (state.history.length > 0) {
            const newGame = new ChessGame(state.fen);
            newGame.undo();
            state.fen = newGame.toFen();  
            state.moves = newGame.getMoves();
            state.history.pop(); // Remove from history
          }
        }
      }
    });
