"""
WebSocket endpoint for real-time document processing status updates.
Uses Redis pub/sub to broadcast status changes from background tasks.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Set
import json
import asyncio
import redis.asyncio as aioredis

from ..core.config import settings

router = APIRouter(prefix="/ws", tags=["websocket"])

# Store active WebSocket connections by document ID
active_connections: Dict[str, Set[WebSocket]] = {}

# Async Redis client for pub/sub
redis_client = None

async def get_redis():
    global redis_client
    if redis_client is None:
        redis_client = await aioredis.from_url(settings.REDIS_URL)
    return redis_client


class ConnectionManager:
    """Manages WebSocket connections for document processing updates."""
    
    def __init__(self):
        self.connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, doc_id: str, websocket: WebSocket):
        await websocket.accept()
        if doc_id not in self.connections:
            self.connections[doc_id] = set()
        self.connections[doc_id].add(websocket)
    
    def disconnect(self, doc_id: str, websocket: WebSocket):
        if doc_id in self.connections:
            self.connections[doc_id].discard(websocket)
            if not self.connections[doc_id]:
                del self.connections[doc_id]
    
    async def broadcast_to_doc(self, doc_id: str, message: dict):
        """broadcast message to all connections watching this document."""
        if doc_id in self.connections:
            disconnected = set()
            for connection in self.connections[doc_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.add(connection)
            # Clean up disconnected clients
            for conn in disconnected:
                self.connections[doc_id].discard(conn)


manager = ConnectionManager()


# Helper function to publish status updates (called from process_document)
def publish_status_sync(doc_id: int, stage: str, progress: int, message: str = ""):
    """Synchronous publish for use in background tasks."""
    import redis
    r = redis.from_url(settings.REDIS_URL)
    payload = {
        "doc_id": doc_id,
        "stage": stage,
        "progress": progress,
        "message": message
    }
    r.publish(f"doc_status:{doc_id}", json.dumps(payload))
    r.close()


@router.websocket("/documents/{doc_id:path}/status")
async def websocket_document_status(websocket: WebSocket, doc_id: str):
    """
    WebSocket endpoint for document processing status updates.
    
    Clients connect to receive real-time status updates as the document
    is processed (uploading -> OCR -> analysis -> graph linking -> complete).
    """
    await manager.connect(doc_id, websocket)
    
    # Get async redis client
    redis = await get_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe(f"doc_status:{doc_id}")
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "doc_id": doc_id,
            "message": "Connected to document processing status"
        })
        
        # Listen for Redis pub/sub messages and forward to WebSocket
        async def listen_redis():
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    await websocket.send_json({
                        "type": "status_update",
                        **data
                    })
                    # If complete, we can close
                    if data.get("stage") == "complete":
                        await websocket.send_json({
                            "type": "complete",
                            "doc_id": doc_id,
                            "message": "Processing complete"
                        })
        
        # Also listen for WebSocket messages (like close)
        async def listen_websocket():
            while True:
                try:
                    data = await websocket.receive_text()
                    # Handle ping/pong or other client messages
                    if data == "ping":
                        await websocket.send_text("pong")
                except WebSocketDisconnect:
                    break
        
        # Run both listeners concurrently
        await asyncio.gather(
            listen_redis(),
            listen_websocket(),
            return_exceptions=True
        )
        
    except WebSocketDisconnect:
        pass
    finally:
        await pubsub.unsubscribe(f"doc_status:{doc_id}")
        manager.disconnect(doc_id, websocket)
