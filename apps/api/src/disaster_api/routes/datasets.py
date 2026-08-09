from fastapi import APIRouter

from ..fixtures import DATASETS
from ..models import DatasetMetadata

router = APIRouter(prefix="/api/v1/datasets", tags=["datasets"])


@router.get("", response_model=list[DatasetMetadata])
def list_datasets() -> tuple[DatasetMetadata, ...]:
    return DATASETS
