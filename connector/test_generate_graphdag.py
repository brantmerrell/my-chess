import json
from fastapi.testclient import TestClient
from main import app 

client = TestClient(app)

def test_graphdag():
    print("Testing graphdag endpoint...")
    with open('expectation_1.json', 'r') as f:
        input_data = json.load(f)
    
    response = client.put("/graphdag", json=input_data)
    print(response)
    assert response.status_code == 200
    print("Success!")

if __name__ == "__main__":
    test_graphdag()
