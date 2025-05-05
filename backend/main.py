from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import requests

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PlayerStats(BaseModel):
    name: str
    team: str
    position: str
    goals: float
    assists: float
    passing_accuracy: float
    tackles: float
    interceptions: float
    dribbles: float
    shots_on_target: float

# Sample data - in a real application, this would come from a database or API
SAMPLE_PLAYERS = [
    PlayerStats(
        name="Erling Haaland",
        team="Manchester City",
        position="Forward",
        goals=0.9,
        assists=0.2,
        passing_accuracy=0.75,
        tackles=0.1,
        interceptions=0.1,
        dribbles=0.8,
        shots_on_target=0.7
    ),
    PlayerStats(
        name="Kevin De Bruyne",
        team="Manchester City",
        position="Midfielder",
        goals=0.3,
        assists=0.8,
        passing_accuracy=0.85,
        tackles=0.3,
        interceptions=0.4,
        dribbles=0.7,
        shots_on_target=0.5
    ),
    PlayerStats(
        name="Mohamed Salah",
        team="Liverpool",
        position="Forward",
        goals=0.7,
        assists=0.4,
        passing_accuracy=0.78,
        tackles=0.2,
        interceptions=0.2,
        dribbles=0.9,
        shots_on_target=0.6
    ),
    PlayerStats(
        name="Bukayo Saka",
        team="Arsenal",
        position="Forward",
        goals=0.5,
        assists=0.6,
        passing_accuracy=0.82,
        tackles=0.4,
        interceptions=0.3,
        dribbles=0.8,
        shots_on_target=0.6
    ),
    PlayerStats(
        name="Declan Rice",
        team="Arsenal",
        position="Midfielder",
        goals=0.2,
        assists=0.3,
        passing_accuracy=0.88,
        tackles=0.9,
        interceptions=0.8,
        dribbles=0.5,
        shots_on_target=0.3
    ),
    PlayerStats(
        name="Virgil van Dijk",
        team="Liverpool",
        position="Defender",
        goals=0.1,
        assists=0.2,
        passing_accuracy=0.89,
        tackles=0.7,
        interceptions=0.8,
        dribbles=0.3,
        shots_on_target=0.2
    ),
    PlayerStats(
        name="Bruno Fernandes",
        team="Manchester United",
        position="Midfielder",
        goals=0.4,
        assists=0.7,
        passing_accuracy=0.83,
        tackles=0.5,
        interceptions=0.6,
        dribbles=0.6,
        shots_on_target=0.5
    ),
    PlayerStats(
        name="Son Heung-min",
        team="Tottenham",
        position="Forward",
        goals=0.6,
        assists=0.5,
        passing_accuracy=0.81,
        tackles=0.3,
        interceptions=0.3,
        dribbles=0.8,
        shots_on_target=0.7
    )
]

@app.get("/")
async def root():
    return {"message": "Welcome to EPL Analytics API"}

@app.get("/players", response_model=List[PlayerStats])
async def get_players():
    return SAMPLE_PLAYERS

@app.get("/players/{player_name}", response_model=PlayerStats)
async def get_player(player_name: str):
    for player in SAMPLE_PLAYERS:
        if player.name.lower() == player_name.lower():
            return player
    return {"error": "Player not found"}

@app.get("/teams")
async def get_teams():
    teams = list(set(player.team for player in SAMPLE_PLAYERS))
    return {"teams": teams}

@app.get("/positions")
async def get_positions():
    positions = list(set(player.position for player in SAMPLE_PLAYERS))
    return {"positions": positions} 