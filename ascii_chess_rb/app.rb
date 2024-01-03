require 'pgn'
require 'sinatra'
require 'net/http'
require 'json'
require 'stringio'


enable :sessions

helpers do
  def fetch_fen_from_source(source)
    case source
    when 'lichess daily puzzle'
      fetch_lichess_puzzle
    when 'chess.com daily puzzle'
      fetch_chess_com_puzzle
    else
      PGN::FEN.start.to_s
    end
  end

  def fetch_lichess_puzzle
    uri = URI('https://lichess.org/api/puzzle/daily')
    response = Net::HTTP.get_response(uri)
    return PGN::FEN.start.to_s unless response.is_a?(Net::HTTPSuccess)


    begin
      content = JSON.parse(response.body)
      pgn_text = content['game']['pgn'].split()
      initial_ply = content['puzzle']['initialPly'].to_i

      game = PGN::Game.new(pgn_text)
      moves = game.moves[0...initial_ply]

      chess_game = PGN::Game.new(moves)

      chess_game.positions.last.to_fen.to_s
    rescue
      PGN::FEN.start.to_s
    end
  end

  def fetch_chess_com_puzzle
    uri = URI('https://api.chess.com/pub/puzzle')
    response = Net::HTTP.get_response(uri)
    return PGN::FEN.start.to_s unless response.is_a?(Net::HTTPSuccess)

    content = JSON.parse(response.body)
    content['fen'] rescue PGN::FEN.start.to_s
  end
end

get '/' do
  puts 'get /'
  puts "fenState: #{session[:fenState]}"
  session[:fenState] ||= PGN::FEN.start.to_s
  session[:moves] ||= []
  session[:ndx_ply] ||= 0
  session[:current_board] ||= PGN::FEN.new(session[:fenState]).to_position.board.inspect

  erb :index
end

post '/select_fen' do
  puts 'post /select_fen'
  source = params['fen_dropdown']
  session[:last_selected_fen_source] = source
  session[:fenState] = fetch_fen_from_source(source)
  puts "fenState: #{session[:fenState]}"
  redirect to('/')
end

post '/submit_fen' do
  puts 'post /submit_fen'
  session[:fenState] = params['fenBox'].strip
  puts "fenState: #{session[:fenState]}"
  session[:moves] = []
  session[:ndx_ply] = 0
  session[:current_board] = PGN::FEN.new(session[:fenState]).to_position.board.inspect
  redirect to('/')
end

post '/submit_move' do
  puts 'post /submit_move'
  move = params['move'].strip
  session[:moves] << move unless move.empty?
  game = PGN::Game.new(session[:moves])
  session[:ndx_ply] = game.positions.length - 1
  session[:current_board] = game.positions[session[:ndx_ply]].board.inspect
  redirect to('/')
end

post '/navigate' do
  puts 'post /navigate'
  session[:ndx_ply] += params['direction'].to_i
  session[:ndx_ply] = 0 if session[:ndx_ply] < 0
  session[:ndx_ply] = session[:moves].length if session[:ndx_ply] > session[:moves].length
  game = PGN::Game.new(session[:moves])
  session[:current_board] = game.positions[session[:ndx_ply]].board.inspect
  redirect to('/')
end

