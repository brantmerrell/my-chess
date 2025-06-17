from fastapi.testclient import TestClient

from main import app 

client = TestClient(app)

def test_adjacencies():
    print("Testing adjacencies endpoint...")
    response = client.get("/adjacencies/?fen_string=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201")
    assert response.status_code == 200
    data = response.json()
    assert "a1" in data 
    assert "a3" not in data
    assert len(data['a1']) > 0
    # TODO: compare to a JSON file
    print(data)
    print("Test passed!")

if __name__ == "__main__":
    test_adjacencies()
