import json
from fastapi.testclient import TestClient
from main import app 

client = TestClient(app)

def test_links():
    print("Testing links endpoint...")
    with open('expectation_1.json', 'r') as f:
        expected_data = json.load(f)

    # Using the same FEN string you used to generate expectation_1.json:
    response = client.get("/links/?fen_string=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") 
    assert response.status_code == 200
    assert response.json() == expected_data
    print("Success!")

if __name__ == "__main__":
    test_links()
