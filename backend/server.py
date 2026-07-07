from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import jwt
from datetime import datetime, timedelta, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY')
ALGORITHM = "HS256"

# PG_Admin connection
def get_db_config():
    return {
        "host": os.environ.get("PG_HOST"),
        "database": os.environ.get("PG_DATABASE"),
        "user": os.environ.get("PG_USER"),
        "password": os.environ.get("PG_PASSWORD"),
        "port": os.environ.get("PG_PORT"),
        "sslmode": "require"
    }

try:
    conn = psycopg2.connect(**get_db_config())
    print("✅ Connected to Neon successfully!")
    conn.close()
except Exception as e:
    print("❌ Connection failed:")
    print(e)

@contextmanager
def get_db_connection():
    conn = psycopg2.connect(**get_db_config())
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Models
class AdminLogin(BaseModel):
    username: str
    password: str

class Sport(BaseModel):
    sports_id: Optional[int] = None
    name: str

class PlayerCreate(BaseModel):
    name: str
    age: int
    email: EmailStr
    sports_ids: List[int]

class PlayerUpdate(BaseModel):
    name: str
    age: int
    email: EmailStr
    sports_ids: List[int]

class Player(BaseModel):
    player_id: str
    name: str
    age: int
    email: str
    sports: List[dict]

# Helper functions
def generate_player_id():
    """Generate sequential player_id"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT player_id FROM player ORDER BY player_id DESC LIMIT 1")
            result = cur.fetchone()
            if result:
                last_id = result[0]
                num = int(last_id.replace('P', '')) + 1
                return f"P{num:04d}"
            return "P0001"

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    admin_user = os.environ.get('ADMIN_USERNAME')
    admin_pass = os.environ.get('ADMIN_PASSWORD')
    
    print("ADMIN_USERNAME =", os.environ.get('ADMIN_USERNAME'))
    print("ADMIN_PASSWORD =", os.environ.get('ADMIN_PASSWORD'))

    if login.username != admin_user or login.password != admin_pass:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode(
        {"username": login.username, "role": "admin", "exp": datetime.now(timezone.utc) + timedelta(hours=24)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {"token": token, "username": login.username}

@api_router.get("/sports", response_model=List[Sport])
async def get_sports():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT sports_id, name FROM sports ORDER BY name")
            sports = cur.fetchall()
            return sports

@api_router.post("/admin/sports", response_model=Sport)
async def add_sport(sport: Sport, _: dict = Depends(verify_admin_token)):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "INSERT INTO sports (name) VALUES (%s) RETURNING sports_id, name",
                (sport.name,)
            )
            new_sport = cur.fetchone()
            return new_sport

@api_router.delete("/admin/sports/{sports_id}")
async def delete_sport(sports_id: int, _: dict = Depends(verify_admin_token)):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Delete from player_sports first
            cur.execute("DELETE FROM player_sports WHERE sports_id = %s", (sports_id,))
            # Delete sport
            cur.execute("DELETE FROM sports WHERE sports_id = %s", (sports_id,))
            return {"message": "Sport deleted successfully"}

@api_router.post("/players", response_model=Player)
async def register_player(player: PlayerCreate):
    player_id = generate_player_id()
    
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Insert player
            cur.execute(
                "INSERT INTO player (player_id, name, age) VALUES (%s, %s, %s)",
                (player_id, player.name, player.age)
            )
            
            # Insert email
            cur.execute(
                "INSERT INTO player_email (player_id, email) VALUES (%s, %s)",
                (player_id, player.email)
            )
            
            # Insert sports
            for sports_id in player.sports_ids:
                cur.execute(
                    "INSERT INTO player_sports (player_id, sports_id) VALUES (%s, %s)",
                    (player_id, sports_id)
                )
            
            # Fetch complete player data
            cur.execute("""
                SELECT p.player_id, p.name, p.age, pe.email,
                       json_agg(json_build_object('sports_id', s.sports_id, 'name', s.name)) as sports
                FROM player p
                JOIN player_email pe ON p.player_id = pe.player_id
                LEFT JOIN player_sports ps ON p.player_id = ps.player_id
                LEFT JOIN sports s ON ps.sports_id = s.sports_id
                WHERE p.player_id = %s
                GROUP BY p.player_id, p.name, p.age, pe.email
            """, (player_id,))
            
            result = cur.fetchone()
            return result

@api_router.get("/players", response_model=List[Player])
async def get_players():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT p.player_id, p.name, p.age, pe.email,
                       COALESCE(json_agg(
                           json_build_object('sports_id', s.sports_id, 'name', s.name)
                       ) FILTER (WHERE s.sports_id IS NOT NULL), '[]') as sports
                FROM player p
                JOIN player_email pe ON p.player_id = pe.player_id
                LEFT JOIN player_sports ps ON p.player_id = ps.player_id
                LEFT JOIN sports s ON ps.sports_id = s.sports_id
                GROUP BY p.player_id, p.name, p.age, pe.email
                ORDER BY p.player_id
            """)
            players = cur.fetchall()
            return players

@api_router.get("/players/{player_id}", response_model=Player)
async def get_player(player_id: str):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT p.player_id, p.name, p.age, pe.email,
                       COALESCE(json_agg(
                           json_build_object('sports_id', s.sports_id, 'name', s.name)
                       ) FILTER (WHERE s.sports_id IS NOT NULL), '[]') as sports
                FROM player p
                JOIN player_email pe ON p.player_id = pe.player_id
                LEFT JOIN player_sports ps ON p.player_id = ps.player_id
                LEFT JOIN sports s ON ps.sports_id = s.sports_id
                WHERE p.player_id = %s
                GROUP BY p.player_id, p.name, p.age, pe.email
            """, (player_id,))
            player = cur.fetchone()
            if not player:
                raise HTTPException(status_code=404, detail="Player not found")
            return player

@api_router.put("/players/{player_id}", response_model=Player)
async def update_player(player_id: str, player: PlayerUpdate):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check if player exists
            cur.execute("SELECT player_id FROM player WHERE player_id = %s", (player_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Player not found")
            
            # Update player
            cur.execute(
                "UPDATE player SET name = %s, age = %s WHERE player_id = %s",
                (player.name, player.age, player_id)
            )
            
            # Update email
            cur.execute(
                "UPDATE player_email SET email = %s WHERE player_id = %s",
                (player.email, player_id)
            )
            
            # Delete old sports
            cur.execute("DELETE FROM player_sports WHERE player_id = %s", (player_id,))
            
            # Insert new sports
            for sports_id in player.sports_ids:
                cur.execute(
                    "INSERT INTO player_sports (player_id, sports_id) VALUES (%s, %s)",
                    (player_id, sports_id)
                )
            
            # Fetch updated player data
            cur.execute("""
                SELECT p.player_id, p.name, p.age, pe.email,
                       COALESCE(json_agg(
                           json_build_object('sports_id', s.sports_id, 'name', s.name)
                       ) FILTER (WHERE s.sports_id IS NOT NULL), '[]') as sports
                FROM player p
                JOIN player_email pe ON p.player_id = pe.player_id
                LEFT JOIN player_sports ps ON p.player_id = ps.player_id
                LEFT JOIN sports s ON ps.sports_id = s.sports_id
                WHERE p.player_id = %s
                GROUP BY p.player_id, p.name, p.age, pe.email
            """, (player_id,))
            
            result = cur.fetchone()
            return result

@api_router.delete("/players/{player_id}")
async def delete_player(player_id: str):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Check if player exists
            cur.execute("SELECT player_id FROM player WHERE player_id = %s", (player_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Player not found")
            
            # Delete from player_sports
            cur.execute("DELETE FROM player_sports WHERE player_id = %s", (player_id,))
            # Delete from player_email
            cur.execute("DELETE FROM player_email WHERE player_id = %s", (player_id,))
            # Delete player
            cur.execute("DELETE FROM player WHERE player_id = %s", (player_id,))
            
            return {"message": "Player deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
