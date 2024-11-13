Rails.application.routes.draw do
  get '/links', to: 'chess#links', format: false
  get '/adjacencies', to: 'chess#adjacencies', format: false
  put '/graphdag', to: 'chess#graphdag', format: false
  get '/*path/', to: redirect { |params, req| req.path.chomp('/') }, format: false
end


