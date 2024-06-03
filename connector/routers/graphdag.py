import subprocess
from fastapi import APIRouter, Request

router = APIRouter()

@router.put("/graphdag")
async def generate_graphdag(request: Request):
    data = await request.json()
    edges = data["edges"]
    filtered_edges = []
    edges_seen = set()
    for edge in edges:
        source = edge['source']
        target = edge['target']
        edge_tuple = (source, target)
        inverse_edge_tuple = (target, source)
        if inverse_edge_tuple not in edges_seen:
            filtered_edges.append(edge)
            edges_seen.add(edge_tuple)
    formatted_edges = [f"{edge['source']}->{edge['target']}" for edge in filtered_edges]
    command = ["diagon", "GraphDAG"]
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    stdout, stderr = process.communicate(input="\n".join(formatted_edges))
    if process.returncode != 0:
        return {"error": "Error executing command", "stderr": stderr}
    else:
        return {"ascii_art": stdout}

