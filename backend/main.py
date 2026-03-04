from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from pathlib import Path

app = FastAPI(title="Battery & Disk Analytics API")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to logs (absolute paths for reliability)
BASE_DIR = Path("c:/ML_Projects/Software_project/Battery-and-Disk-Analytics")
DISK_LOG = BASE_DIR / "battery_and_disk_agent/logs/disk_telemetry.jsonl"
BATTERY_LOG = BASE_DIR / "battery_and_disk_agent/logs/battery_telemetry.jsonl"

def read_last_n_lines(file_path: Path, n: int = 50):
    if not file_path.exists():
        return []
    
    lines = []
    try:
        with open(file_path, "r") as f:
            # Read all lines and take the last n
            # For large files, we'd use a more efficient tail-like approach
            all_lines = f.readlines()
            for line in all_lines[-n:]:
                if line.strip():
                    lines.append(json.loads(line))
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    
    return lines

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/battery")
async def get_battery_data(limit: int = Query(50, gt=0, le=500)):
    """Returns the most recent battery telemetry data."""
    data = read_last_n_lines(BATTERY_LOG, limit)
    return {"count": len(data), "data": data}

@app.get("/api/disk")
async def get_disk_data(limit: int = Query(50, gt=0, le=500)):
    """Returns the most recent disk telemetry data."""
    data = read_last_n_lines(DISK_LOG, limit)
    return {"count": len(data), "data": data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
