require 'rails_helper'

RSpec.describe ChessController, type: :controller do
  describe 'GET
    it 'returns correct adjacencies for initial position' do
      get :adjacencies, params: {
        fen_string: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      }

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response).to include('a1')
      expect(json_response).not_to include('a3')
      expect(json_response['a1'].length).to be > 0
    end
  end

  describe 'GET
    it 'returns nodes and edges for initial position' do
      get :links, params: {
        fen_string: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      }

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response).to include('nodes', 'edges')
    end
  end

  describe 'PUT
    it 'generates acyclic graph' do
      put :graphdag, params: { edges: [
        { 'source' => 'a', 'target' => 'b' },
        { 'source' => 'b', 'target' => 'c' }
      ]}

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response).to include('ascii_art')
    end
  end
end

