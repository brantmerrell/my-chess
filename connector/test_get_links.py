import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_links():
    print("Testing links endpoint...")
    with open("links_0.json", "r") as f:
        expected_data = json.load(f)

    # Using the same FEN string you used to generate links_0.json:
    response = client.get(
        "/links/?fen_string=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    )
    assert response.status_code == 200
    assert response.json() == expected_data
    print("Success!")


if __name__ == "__main__":
    test_links()
