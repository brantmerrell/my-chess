import { ChessComPuzzleResponse } from "./ChessComPuzzleResponse";
import { ChessComPuzzleModel } from "./ChessComPuzzleModel";

export class ChessComPuzzleViewModel {
  private chessComPuzzleResponse: ChessComPuzzleResponse;
  constructor(chessComPuzzleResponse: ChessComPuzzleResponse) {
    this.chessComPuzzleResponse = chessComPuzzleResponse;
  }
  get puzzle(): ChessComPuzzleModel {
    const pgnArr = this.chessComPuzzleResponse.pgn.split(" ");

    return {
      puzzleTitle: this.chessComPuzzleResponse.title,
      puzzleUrl: this.chessComPuzzleResponse.url,
      publishTime: this.chessComPuzzleResponse.publish_time,
      imageUrl: this.chessComPuzzleResponse.image,
      solutionPgn: pgnArr,
      initialPuzzleFEN: this.chessComPuzzleResponse.fen,
      fetchStatus: {
        loading: false,
        error: null,
      },
    };
  }
}
