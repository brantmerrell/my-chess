import { LiChessPuzzleModel } from '../../models/LiChessPuzzleModel';
import { LiChessPuzzleResponse } from '../../models/LiChessPuzzleResponse';
import { FOOT_FETCH_SUCCESS, FOOT_FETCH_FAILURE } from './puzzles.actions';

interface LiChessPuzzleState {
  liChessPuzzleModel: LiChessPuzzleModel | null;
  liChessPuzzleResponse: LiChessPuzzleResponse | null;
}

const initialState: LiChessPuzzleState = {
  liChessPuzzleModel: null,
  liChessPuzzleResponse: null,
};

export const liChessPuzzleReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case FOOT_FETCH_SUCCESS:
      return {
        liChessPuzzleModel: action.payload.liChessPuzzle,
        liChessPuzzleResponse: action.payload.liChessPuzzleResponse,
      };
    case FOOT_FETCH_FAILURE:
      return {
        liChessPuzzleModel: null,
        liChessPuzzleResponse: null,
      };
    default:
      return state;
  }
};

