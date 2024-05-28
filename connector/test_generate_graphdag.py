import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_graphdag():
    print("Testing graphdag endpoint...")
    with open('expectation_1.json', 'r') as f:
        input_data = json.load(f)
    with open('graphdag.txt', 'r') as f:
        expected_ascii_art = f.read().strip()
    response = client.put("/graphdag", json=input_data)
    actual_ascii_art = response.json().get('ascii_art', '').strip()
    assert response.status_code == 200
    assert actual_ascii_art == expected_ascii_art
    print("Success!")


if __name__ == "__main__":
    test_graphdag()
