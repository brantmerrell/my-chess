export abstract class PuzzleViewModel<TResponse, TModel> {
  protected response: TResponse;

  constructor(response: TResponse) {
    this.response = response;
  }

  abstract get puzzle(): TModel;
}
