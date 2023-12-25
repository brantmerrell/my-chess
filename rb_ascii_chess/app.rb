require 'pgn'
require 'sinatra'
require 'stringio'


enable :sessions

get '/' do
  puts 'get /'
  session[:fenState] ||= PGN::FEN.start.to_s
  session[:moves] ||= []
  session[:ndx_ply] ||= 0
  session[:current_board] ||= PGN::FEN.new(session[:fenState]).to_position.board.inspect

  erb :index
end

post '/submit_fen' do
  puts 'post /submit_fen'
  session[:fenState] = params['fen'].strip
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

