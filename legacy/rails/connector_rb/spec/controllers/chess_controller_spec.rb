require 'rails_helper'

RSpec.describe ChessController, type: :controller do
  def adjacencies
    begin
      board = ChessUtils::Board.new(params[:fen_string])
      nodes = get_nodes(board)  # Use the same get_nodes method as links endpoint
      edges = []

      nodes.each do |node|
        square = node[:square]
        adjacent_squares = adjacent_pieces(board, ChessUtils::SQUARE_NAMES.index(square))
        adjacent_squares.each do |adj_square|
          edges << {
            type: 'adjacent',
            source: square,
            target: ChessUtils::SQUARE_NAMES[adj_square]
          }
        end
      end

      render json: { nodes: nodes, edges: edges }
    rescue StandardError => e
      render json: { error: e.message }, status: :bad_request
    end
  end
  describe 'GET #links' do
    it 'returns the correct links for a standard chess setup' do
      fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      get :links, params: { fen_string: fen }
      expect(response).to have_http_status(:success)

      expected_output = JSON.parse(File.read('spec/fixtures/links_standard.json'))

      json_response = JSON.parse(response.body)

      expect(json_response).to eq(expected_output)
    end
  end
  describe 'GET #adjacencies' do
    it 'returns the correct adjacencies for a standard chess setup' do
      fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      get :adjacencies, params: { fen_string: fen }
      expect(response).to have_http_status(:success)

      expected_output = JSON.parse(File.read('spec/fixtures/adjacencies_standard.json'))

      json_response = JSON.parse(response.body)

      expect(json_response).to eq(expected_output)
    end
  end
end
