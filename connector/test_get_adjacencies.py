import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_adjacencies():
    print("Testing adjacencies endpoint...")
    with open("adjacencies_0.json", "r") as f:
        expected_data = json.load(f)
    response = client.get(
        "/adjacencies/?fen_string=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201"
    )
    assert response.status_code == 200
    assert response.json() == expected_data
    print("Test passed!")


if __name__ == "__main__":
    test_adjacencies()
