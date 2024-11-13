require 'set'

module ChessUtils
  class Piece
    attr_reader :type, :color

    def initialize(type, color)
      @type = type
      @color = color
    end

    def symbol
      case type
      when :king then color == :white ? 'K' : 'k'
      when :queen then color == :white ? 'Q' : 'q'
      when :rook then color == :white ? 'R' : 'r'
      when :bishop then color == :white ? 'B' : 'b'
      when :knight then color == :white ? 'N' : 'n'
      when :pawn then color == :white ? 'P' : 'p'
      end
    end
  end

  class Board
    attr_reader :pieces

    def initialize(fen_string)
      @pieces = {}
      parse_fen(fen_string)
    end

    def piece_at(square)
      @pieces[square]
    end

    def attacks_mask(square)
      piece = piece_at(square)
      return [] unless piece

      moves = []
      case piece.type
      when :knight
        moves = knight_moves(square)
      when :bishop
        moves = bishop_moves(square)
      when :rook
        moves = rook_moves(square)
      when :queen
        moves = bishop_moves(square) + rook_moves(square)
      when :king
        moves = king_moves(square)
      when :pawn
        moves = pawn_attacks(square, piece.color)
      end

      moves.select { |target| valid_target?(target, piece.color) }
    end

    def attackers(color, target_square)
      SQUARES.select do |square|
        piece = piece_at(square)
        piece && piece.color == color && attacks_mask(square).include?(target_square)
      end
    end

    private

    def parse_fen(fen_string)
      ranks = fen_string.split.first.split('/')
      ranks.each_with_index do |rank, rank_index|
        file_index = 0
        rank.each_char do |char|
          if char.match?(/\d/)
            file_index += char.to_i
          else
            square = (7 - rank_index) * 8 + file_index
            color = char.match?(/[A-Z]/) ? :white : :black
            type = case char.downcase
                   when 'p' then :pawn
                   when 'n' then :knight
                   when 'b' then :bishop
                   when 'r' then :rook
                   when 'q' then :queen
                   when 'k' then :king
                   end
            @pieces[square] = Piece.new(type, color)
            file_index += 1
          end
        end
      end
    end

    def valid_target?(target_square, attacking_color)
      return false unless target_square >= 0 && target_square < 64
      piece = piece_at(target_square)
      !piece || piece.color != attacking_color
    end

    def knight_moves(square)
      file, rank = square % 8, square / 8
      moves = []
      [[-2, -1], [-2, 1], [-1, -2], [-1, 2],
       [1, -2], [1, 2], [2, -1], [2, 1]].each do |df, dr|
        new_file = file + df
        new_rank = rank + dr
        if new_file.between?(0, 7) && new_rank.between?(0, 7)
          moves << new_rank * 8 + new_file
        end
      end
      moves
    end

    def bishop_moves(square)
      moves = []
      file, rank = square % 8, square / 8
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].each do |df, dr|
        current_file, current_rank = file, rank
        loop do
          current_file += df
          current_rank += dr
          break unless current_file.between?(0, 7) && current_rank.between?(0, 7)
          new_square = current_rank * 8 + current_file
          moves << new_square
          break if piece_at(new_square)
        end
      end
      moves
    end

    def rook_moves(square)
      moves = []
      file, rank = square % 8, square / 8
      [[0, -1], [0, 1], [-1, 0], [1, 0]].each do |df, dr|
        current_file, current_rank = file, rank
        loop do
          current_file += df
          current_rank += dr
          break unless current_file.between?(0, 7) && current_rank.between?(0, 7)
          new_square = current_rank * 8 + current_file
          moves << new_square
          break if piece_at(new_square)
        end
      end
      moves
    end

    def king_moves(square)
      file, rank = square % 8, square / 8
      moves = []
      (-1..1).each do |df|
        (-1..1).each do |dr|
          next if df == 0 && dr == 0
          new_file = file + df
          new_rank = rank + dr
          if new_file.between?(0, 7) && new_rank.between?(0, 7)
            moves << new_rank * 8 + new_file
          end
        end
      end
      moves
    end

    def pawn_attacks(square, color)
      file, rank = square % 8, square / 8
      moves = []
      direction = color == :white ? 1 : -1

      [-1, 1].each do |df|
        new_file = file + df
        new_rank = rank + direction
        if new_file.between?(0, 7) && new_rank.between?(0, 7)
          moves << new_rank * 8 + new_file
        end
      end
      moves
    end
  end

  SQUARES = (0..63).to_a
  SQUARE_NAMES = SQUARES.map do |sq|
    file = ('a'.ord + (sq % 8)).chr
    rank = (sq / 8 + 1).to_s
    file + rank
  end.freeze

  def self.scan_reversed(squares)
    squares.sort.reverse
  end
end

