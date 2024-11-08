require 'rails_helper'

RSpec.describe ChessController, type: :controller do
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
end
