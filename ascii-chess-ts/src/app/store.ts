import { createStore, combineReducers } from '@reduxjs/toolkit';
import { liChessPuzzleReducer } from '../reducers/puzzles/puzzles.reducers';

const store = createStore(combineReducers({
  liChessPuzzle: liChessPuzzleReducer,
}));
