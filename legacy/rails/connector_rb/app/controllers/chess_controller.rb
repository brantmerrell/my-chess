class ChessController < ApplicationController
  def adjacencies
    begin
      board = ChessUtils::Board.new(params[:fen_string])
      nodes = get_nodes(board)  
      edges = []

      nodes.each do |node|
        square_index = ChessUtils::SQUARE_NAMES.index(node[:square])
        adjacent_squares = adjacent_pieces(board, square_index)

        adjacent_squares.each do |adj_square|
          edges << {
            type: "adjacent",
            source: node[:square],
            target: ChessUtils::SQUARE_NAMES[adj_square]
          }
        end
      end

      render json: { nodes: nodes, edges: edges }
    rescue StandardError => e
      render json: { error: e.message }, status: :bad_request
    end
  end

  def links
    begin
      board = ChessUtils::Board.new(params[:fen_string])
      nodes = get_nodes(board)
      edges = get_edges(board)
      render json: { nodes: nodes, edges: edges }
    rescue StandardError => e
      render json: { error: e.message }, status: :bad_request
    end
  end

  def graphdag
    begin
      edges = params[:edges]
      acyclic_graph = build_acyclic_graph(edges)
      formatted_edges = acyclic_graph.edges.map { |u, v, _| "#{u}->#{v}" }
      ascii_art = generate_graph_ascii(formatted_edges)
      render json: { ascii_art: ascii_art }
    rescue StandardError => e
      render json: { error: e.message }, status: :bad_request
    end
  end

  private

  def adjacent_pieces(board, square)
    file, rank = square % 8, square / 8
    adjacent_squares = []
    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].each do |df, dr|
      new_file = file + df
      new_rank = rank + dr
      if new_file.between?(0, 7) && new_rank.between?(0, 7)
        new_square = new_rank * 8 + new_file
        adjacent_squares << new_square if board.piece_at(new_square)
      end
    end
    adjacent_squares
  end

  def get_nodes(board)
    nodes = []
    ChessUtils::SQUARES.each do |square|
      piece = board.piece_at(square)
      if piece
        nodes << {
          square: ChessUtils::SQUARE_NAMES[square],
          piece_type: piece.symbol,
          color: piece.color.to_s
        }
      end
    end
    nodes
  end

  def get_edges(board)
    edges = []
    ChessUtils::SQUARES.each do |square|
      piece = board.piece_at(square)
      if piece
        attackers = board.attackers(!piece.color, square)
        defenders = board.attackers(piece.color, square)

        attackers.each do |attacker_square|
          edges << {
            type: 'threat',
            source: ChessUtils::SQUARE_NAMES[attacker_square],
            target: ChessUtils::SQUARE_NAMES[square]
          }
        end

        defenders.each do |defender_square|
          edges << {
            type: 'protection',
            source: ChessUtils::SQUARE_NAMES[defender_square],
            target: ChessUtils::SQUARE_NAMES[square]
          }
        end
      end
    end
    edges
  end

  def build_acyclic_graph(edges)
    graph = NetworkX::DiGraph.new
    edges.each do |edge|
      graph.add_edge(edge['source'], edge['target'])
      unless graph.is_directed_acyclic_graph?
        graph.remove_edge(edge['source'], edge['target'])
      end
    end
    graph
  end

  def generate_graph_ascii(edges)
    require 'tempfile'

    Tempfile.create(['graph', '.dot']) do |f|
      f.puts "digraph G {"
      edges.each { |edge| f.puts "  #{edge};" }
      f.puts "}"
      f.flush

      output = `dot -Tascii #{f.path}`.strip
      return output.present? ? output : edges.join("\n")
    end
  rescue StandardError => e
    edges.join("\n")
  end
end


