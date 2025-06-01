#!/usr/bin/env python3
"""
Microservice simple - Créateur de messages
Un seul endpoint POST pour créer des messages
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import uvicorn
import os
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# App FastAPI
app = FastAPI(
    title="Message Creator Service",
    description="Microservice pour créer des messages",
    version="1.0.0"
)

# Modèle de données
class MessageRequest(BaseModel):
    text: str

class MessageResponse(BaseModel):
    id: str
    text: str
    timestamp: datetime
    status: str

# Endpoint principal
@app.post("/", response_model=MessageResponse)
async def create_message(message: MessageRequest):
    """Créer un nouveau message - endpoint principal du microservice"""
    try:
        # Génération d'un ID simple
        message_id = f"msg_{int(datetime.now().timestamp())}"
        
        # Création du message
        response = MessageResponse(
            id=message_id,
            text=message.text,
            timestamp=datetime.now(),
            status="created"
        )
        
        logger.info(f"💬 Message créé: {message_id} - {message.text[:50]}...")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Erreur: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création")

# Health check minimal
@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}

# Point d'entrée
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"🚀 Message Creator Service démarré sur {host}:{port}")
    
    uvicorn.run(app, host=host, port=port, reload=False)