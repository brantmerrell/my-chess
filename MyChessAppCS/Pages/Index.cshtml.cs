using Microsoft.AspNetCore.Mvc.RazorPages;
using Chess; 

public class IndexModel : PageModel
{
    public ChessBoard chessBoard { get; private set; }
    public string BoardAscii { get; private set; }

    public IndexModel()
    {
        chessBoard = new ChessBoard();
        BoardAscii = chessBoard.ToAscii();
    }

    public void OnGet()
    {
        chessBoard = HttpContext.Session.GetObject<ChessBoard>("ChessBoard") ?? new ChessBoard();
        BoardAscii = chessBoard.ToAscii();
    }

    public void OnPost(string move)
    {
        chessBoard = HttpContext.Session.GetObject<ChessBoard>("ChessBoard") ?? new ChessBoard();
        if (!string.IsNullOrEmpty(move))
        {
            chessBoard.Move(move);
        }
        HttpContext.Session.SetObject("ChessBoard", chessBoard);
        BoardAscii = chessBoard.ToAscii();
    }

    public void OnPostFEN()
    {
        string? fen = Request.Form["submitFEN"];
        chessBoard = HttpContext.Session.GetObject<ChessBoard>("ChessBoard") ?? new ChessBoard();
        if (!string.IsNullOrEmpty(fen))
        {
            chessBoard = ChessBoard.LoadFromFen(fen);
        }
        HttpContext.Session.SetObject("ChessBoard", chessBoard);
        BoardAscii = chessBoard.ToAscii();
    }
}
