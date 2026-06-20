import { PuzzleViewModel } from "./PuzzleViewModel";
import { ChessComPuzzleResponse } from "./ChessComPuzzleResponse";
import { ChessComPuzzleModel } from "./ChessComPuzzleModel";

export class ChessComPuzzleViewModel extends PuzzleViewModel<
  ChessComPuzzleResponse,
  ChessComPuzzleModel
> {
  get puzzle(): ChessComPuzzleModel {
    const pgnArr = this.response.pgn.split(" ");

    return {
      puzzleTitle: this.response.title,
      puzzleUrl: this.response.url,
      publishTime: this.response.publish_time,
      imageUrl: this.response.image,
      solutionPgn: pgnArr,
      initialPuzzleFEN: this.response.fen,
      fetchStatus: {
        loading: false,
        error: null,
      },
    };
  }
}
