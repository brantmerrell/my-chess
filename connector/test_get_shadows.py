from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_shadows_docstring_example():
    """Test the example from the docstring: Q on a4 shadows n on e4 through P on d4."""
    fen = "2q1k3/3n1pp1/2N4p/3p4/Q2Pn3/5N1P/5PPK/8 b - - 9 31"
    response = client.get(f"/shadows/?fen_string={fen}")
    assert response.status_code == 200

    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    edges = data["edges"]

    caster_edge = next(
        (s for s in edges if s["source"] == "a4" and s["target"] == "d4"), None
    )
    assert caster_edge is not None
    assert caster_edge["type"] == "caster_protection"

    shadow_edge = next(
        (s for s in edges if s["source"] == "d4" and s["target"] == "e4"), None
    )
    assert shadow_edge is not None
    assert shadow_edge["type"] == "shadow_threat"


def test_shadows_starting_position():
    """Test starting position - rooks and queens are blocked but have pieces behind."""
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    response = client.get(f"/shadows/?fen_string={fen}")
    assert response.status_code == 200

    data = response.json()
    edges = data["edges"]

    caster_edge = next(
        (s for s in edges if s["source"] == "d1" and s["type"].startswith("caster")), None
    )
    assert caster_edge is not None

    shadow_edge = next(
        (s for s in edges if s["type"].startswith("shadow")), None
    )
    assert shadow_edge is not None


def test_shadows_empty_board_with_single_queen():
    """A single piece with no others in its path has no shadows."""
    fen = "8/8/8/3Q4/8/8/8/8 w - - 0 1"
    response = client.get(f"/shadows/?fen_string={fen}")
    assert response.status_code == 200

    data = response.json()
    assert len(data["edges"]) == 0


def test_shadows_rook_vertical():
    """Test rook casting shadow vertically."""
    fen = "8/8/3p4/8/3P4/8/8/3R4 w - - 0 1"
    response = client.get(f"/shadows/?fen_string={fen}")
    assert response.status_code == 200

    edges = response.json()["edges"]

    caster_edge = next(
        (s for s in edges if s["source"] == "d1" and s["target"] == "d4"), None
    )
    assert caster_edge is not None
    assert caster_edge["type"] == "caster_protection"

    shadow_edge = next(
        (s for s in edges if s["source"] == "d4" and s["target"] == "d6"), None
    )
    assert shadow_edge is not None
    assert shadow_edge["type"] == "shadow_threat"


def test_shadows_bishop_diagonal():
    """Test bishop casting shadow diagonally."""
    fen = "8/8/5p2/8/3P4/8/1B6/8 w - - 0 1"
    response = client.get(f"/shadows/?fen_string={fen}")
    assert response.status_code == 200

    edges = response.json()["edges"]

    caster_edge = next(
        (s for s in edges if s["source"] == "b2" and s["target"] == "d4"), None
    )
    assert caster_edge is not None
    assert caster_edge["type"] == "caster_protection"

    shadow_edge = next(
        (s for s in edges if s["source"] == "d4" and s["target"] == "f6"), None
    )
    assert shadow_edge is not None
    assert shadow_edge["type"] == "shadow_threat"


def test_shadows_knight_casts_no_shadow():
    """Knights cannot cast shadows."""
    fen = "8/8/8/3p4/3N4/3p4/8/8 w - - 0 1"
    response = client.get(f"/shadows/?fen_string={fen}")
    assert response.status_code == 200

    edges = response.json()["edges"]
    assert len(edges) == 0


def test_shadows_protection():
    """Test shadow_protection when source and target are same color."""
    fen = "8/8/3N4/8/3P4/8/8/3R4 w - - 0 1"
    response = client.get(f"/shadows/?fen_string={fen}")
    assert response.status_code == 200

    edges = response.json()["edges"]

    caster_edge = next(
        (s for s in edges if s["source"] == "d1" and s["target"] == "d4"), None
    )
    assert caster_edge is not None
    assert caster_edge["type"] == "caster_protection"

    shadow_edge = next(
        (s for s in edges if s["source"] == "d4" and s["target"] == "d6"), None
    )
    assert shadow_edge is not None
    assert shadow_edge["type"] == "shadow_protection"


def test_shadows_caster_threat():
    """Test caster_threat when sliding piece and blocker are different colors."""
    fen = "8/8/3n4/8/3p4/8/8/3R4 w - - 0 1"
    response = client.get(f"/shadows/?fen_string={fen}")
    assert response.status_code == 200

    edges = response.json()["edges"]

    caster_edge = next(
        (s for s in edges if s["source"] == "d1" and s["target"] == "d4"), None
    )
    assert caster_edge is not None
    assert caster_edge["type"] == "caster_threat"

    shadow_edge = next(
        (s for s in edges if s["source"] == "d4" and s["target"] == "d6"), None
    )
    assert shadow_edge is not None
    assert shadow_edge["type"] == "shadow_threat"


if __name__ == "__main__":
    test_shadows_docstring_example()
    test_shadows_starting_position()
    test_shadows_empty_board_with_single_queen()
    test_shadows_rook_vertical()
    test_shadows_bishop_diagonal()
    test_shadows_knight_casts_no_shadow()
    test_shadows_protection()
    test_shadows_caster_threat()
    print("All shadow tests passed!")
