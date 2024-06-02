def get_formatted_moves(board):
    # Create a list to store move strings
    move_strings = [str(move) for move in board.legal_moves]
    return move_strings

