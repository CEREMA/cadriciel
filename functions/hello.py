#!/usr/bin/env python3
"""
Microservice Hello World en Python avec FastAPI
Exemple simple d'API REST avec quelques endpoints de base
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import uvicorn
import os

# Initialisation de l'app FastAPI
app = FastAPI(
    title="Hello World Microservice",
    description="Un microservice simple avec FastAPI",
    version="1.0.0"
)

# Modèle Pydantic pour les données
class Message(BaseModel):
    text: str
    timestamp: datetime = None

# Base de données en mémoire (pour l'exemple)
messages = []

# Routes
@app.get("/")
async def root():
    """Endpoint racine - Hello World basique"""
    return {
        "message": "Hello World!",
        "service": "Python Microservice",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check pour monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/hello/{name}")
async def hello_name(name: str):
    """Salutation personnalisée"""
    return {
        "message": f"Hello {name}!",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/messages")
async def create_message(message: Message):
    """Créer un nouveau message"""
    message.timestamp = datetime.now()
    messages.append(message.dict())
    return {
        "status": "created",
        "message": message.dict()
    }

@app.get("/messages")
async def get_messages():
    """Récupérer tous les messages"""
    return {
        "count": len(messages),
        "messages": messages
    }

@app.get("/messages/{message_id}")
async def get_message(message_id: int):
    """Récupérer un message par ID"""
    if message_id < 0 or message_id >= len(messages):
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {
        "id": message_id,
        "message": messages[message_id]
    }

@app.delete("/messages/{message_id}")
async def delete_message(message_id: int):
    """Supprimer un message par ID"""
    if message_id < 0 or message_id >= len(messages):
        raise HTTPException(status_code=404, detail="Message not found")
    
    deleted_message = messages.pop(message_id)
    return {
        "status": "deleted",
        "message": deleted_message
    }

# Point d'entrée principal
if __name__ == "__main__":
    # Configuration du serveur
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    
    print(f"🚀 Démarrage du microservice sur http://{host}:{port}")
    print("📖 Documentation API disponible sur http://127.0.0.1:8000/docs")
    
    # Lancement du serveur
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        reload=True  # Auto-reload en développement
    )