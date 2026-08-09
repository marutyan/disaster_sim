from fastapi import FastAPI

from .routes.datasets import router as datasets_router
from .routes.scenarios import router as scenarios_router

app = FastAPI(title="Disaster Simulation API", version="0.1.0")
app.include_router(scenarios_router)
app.include_router(datasets_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
