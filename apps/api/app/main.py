from fastapi import FastAPI

app = FastAPI(
    title="Disaster Simulation API",
    version="0.1.0",
    description="Training-only API for the disaster simulation MVP.",
)


@app.get("/health")
def health() -> dict[str, str]:
    """Return liveness for local development and orchestration."""
    return {"status": "ok"}
