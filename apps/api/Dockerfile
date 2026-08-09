FROM python:3.12-slim

WORKDIR /app
COPY apps/api apps/api
COPY data data
RUN python -m pip install --no-cache-dir -e apps/api

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--app-dir", "apps/api", "--host", "0.0.0.0", "--port", "8000"]
