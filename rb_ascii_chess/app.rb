require 'pgn'
require 'sinatra'
require 'stringio'

startFen = PGN::FEN.start.to_s

enable :sessions

get '/' do
  session[:moves] ||= []
  session[:current_position] ||= 0

  if session[:moves].empty?
    fen = PGN::FEN.new(startFen)
    session[:current_board] = fen.to_position.board.inspect
  end
  erb :index
end


post '/submit_move' do
  puts 'submit_move'
  move = params['move'].strip
  puts "move: #{move}"
  session[:moves] << move unless move.empty?
  puts "moves: #{session[:moves].inspect}"
  game = PGN::Game.new(session[:moves])
  puts "game: #{game.inspect}"
  puts "positions: #{game.positions.inspect}"
  session[:current_position] = game.positions.length - 1
  session[:current_board] = game.positions[session[:current_position]].board.inspect
  redirect to('/')
end

post '/navigate' do
  session[:current_position] += params['direction'].to_i
  session[:current_position] = 0 if session[:current_position] < 0
  session[:current_position] = session[:moves].length if session[:current_position] > session[:moves].length
  game = PGN::Game.new(session[:moves])
  session[:current_board] = game.positions[session[:current_position]].board.inspect
  redirect to('/')
end

