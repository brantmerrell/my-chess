import subprocess
#import json
from fastapi import APIRouter, Request
from utils import build_acyclic_graph

router = APIRouter()

@router.put("/graphdag")
async def generate_graphdag(request: Request):
    data = await request.json()
    edges = data["edges"]
    acyclic_graph = build_acyclic_graph(edges)
    formatted_edges = [f"{u}->{v}" for u, v, _ in acyclic_graph.edges(data=True)]
    command = ["diagon", "GraphDAG"]
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    stdout, stderr = process.communicate(input="\n".join(formatted_edges))
    if process.returncode != 0:
        return {"error": "Error executing command", "stderr": stderr}
    else:
        return {"ascii_art": stdout}

