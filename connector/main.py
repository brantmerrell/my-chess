from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from routers.graphdag import router as graphdag_router
from routers.diff import router as diff_router
from routers.connections import router as connections_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphdag_router)
app.include_router(diff_router)
app.include_router(connections_router)


@app.get("/health")
async def health_check():
    # should this depend on tests or are healthchecks just network checks?
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
