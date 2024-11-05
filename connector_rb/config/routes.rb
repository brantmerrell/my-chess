Rails.application.routes.draw do
  get 'adjacencies/:fen_string', to: 'chess
  get 'links/:fen_string', to: 'chess
  put 'graphdag', to: 'chess
end
