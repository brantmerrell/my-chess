from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from routers.adjacencies import router as adjacencies_router
from routers.links import router as links_router
from routers.graphdag import router as graphdag_router
from routers.king_box import router as king_box_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(adjacencies_router)
app.include_router(links_router)
app.include_router(graphdag_router)
app.include_router(king_box_router)


@app.get("/health")
async def health_check():
    # should this depend on tests or are healthchecks just network checks?
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000)
