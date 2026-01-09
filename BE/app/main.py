from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.types import Scope, Receive, Send
import os

# Import your routes
from app.auth.auth_routes import router as auth_router
from app.routes.patient_routes import router as patient_router 
from app.routes.staff_routes import router as staff_router
from app.routes.frame_routes import router as frame_router
from app.routes.retrieval_batch_routes import router as retrieval_batch_router
from app.routes.appointment_routes import router as appointment_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.journey_routes import router as journey_router
from app.routes.evaluation_routes import router as evaluation_router
from app.config import settings


class CORSStaticFiles(StaticFiles):
    """StaticFiles with CORS headers for images"""
    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            # Wrap send to add CORS headers
            async def send_with_cors(message):
                if message["type"] == "http.response.start":
                    headers = list(message.get("headers", []))
                    # Add CORS headers
                    headers.append((b"access-control-allow-origin", b"*"))
                    headers.append((b"access-control-allow-methods", b"GET, OPTIONS"))
                    headers.append((b"access-control-allow-headers", b"*"))
                    message["headers"] = headers
                await send(message)
            
            await super().__call__(scope, receive, send_with_cors)
        else:
            await super().__call__(scope, receive, send)

# --------------------------------------------------
# Initialize FastAPI
# --------------------------------------------------
app = FastAPI(
    title="Egg Bank API",
    description="Backend for patient + staff/admin workflows",
    version="1.0.0",
)

# --------------------------------------------------
# CORS (FE localhost + production domains)
# --------------------------------------------------
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Static Files (for serving frame images)
# --------------------------------------------------
# Create storage directory if it doesn't exist
os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)

# Mount storage directory with CORS-enabled StaticFiles
app.mount("/storage", CORSStaticFiles(directory=settings.LOCAL_STORAGE_DIR), name="storage")

# --------------------------------------------------
# API Routers
# --------------------------------------------------
app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(staff_router)
app.include_router(frame_router)
app.include_router(retrieval_batch_router)
app.include_router(appointment_router)
app.include_router(dashboard_router)
app.include_router(journey_router)
app.include_router(evaluation_router)

# --------------------------------------------------
# Health Check
# --------------------------------------------------
@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Egg Bank API running"
    }
