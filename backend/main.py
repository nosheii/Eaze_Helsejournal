from fastapi import FastAPI
from database import init_db, getConnection
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware 
from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from typing import Optional

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
app = FastAPI() # Oppretter en FastAPI-applikasjon
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]) # Legger til CORS-middleware for å tillate forespørsler fra alle opprinnelser
init_db() # Initialiserer databasen ved oppstart av applikasjonen

@app.get("/") # Definerer en GET-endpoint på roten av applikasjonen
async def root(): # Returnerer en enkel melding for å indikere at serveren kjører
    return {"msg": "You are connected"}

class Pasient(BaseModel): # Definerer en Pydantic-modell for Pasient som brukes til validering av innkommende data
    pasientID : int 
    fornavn : str
    etternavn : str
    fnr : str
    tlf : str
    adresse : str
    epost : str

@app.post("/leggTilPas") # Endpoint for å legge til en ny pasient
def leggTilPas(pasient:Pasient): # Tar imot pasientdata som en Pasient-modell
    connection = getConnection()
    connection.execute(
        """INSERT INTO pasient (
                                fornavn, etternavn, fnr, tlf, adresse, epost
                                ) VALUES (?,?,?,?,?,?) """ , # Grunnen til spørsmålstegn er for å validere at du ikke sender inn SQL statements, for sikkerhetsmessige grunner
                                (pasient.fornavn, pasient.etternavn, pasient.fnr, pasient.tlf, pasient.adresse, pasient.epost)
    )
    connection.commit()
    connection.close()
    return {"status":"Success!"}

# Hemmelighet for å signere JWT tokens - VIKTIG: Bytt dette til noe hemmelig i produksjon!
SECRET_KEY = "din-hemmelige-nokkel-som-ingen-andre-skal-vite-om-123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Konfigurer passord-hashing (dette har dere kanskje allerede)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Pydantic model for login-request
class LoginRequest(BaseModel):
    brukernavn: str
    passord: str

# Pydantic model for login-response
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    rolle: str
    brukerinfo: dict

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifiserer om et passord matcher den hashede versjonen"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """Lager en JWT token med den gitte dataen"""
    to_encode = data.copy()
    
    # Sett utløpstid for token (30 minutter fra nå)
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Lag JWT token med vår hemmelige nøkkel
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Login endpoint som:
    1. Sjekker om brukernavn finnes
    2. Verifiserer passord
    3. Finner ut om det er en lege eller pasient
    4. Returnerer JWT token med brukerinfo
    """
    connection = getConnection()
    cursor = connection.cursor()
    
    try:
        # 1. Hent bruker fra databasen basert på brukernavn
        cursor.execute("""
            SELECT userID, brukernavn, passord, ansattID, fnr 
            FROM user 
            WHERE brukernavn = ?
        """, (login_data.brukernavn,))
        
        user = cursor.fetchone()
        
        # 2. Sjekk om bruker finnes
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Feil brukernavn eller passord"
            )
        
        # 3. Verifiser passord
        if not verify_password(login_data.passord, user["passord"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Feil brukernavn eller passord"
            )
        
        # 4. Finn ut om det er lege eller pasient
        rolle = None
        brukerinfo = {}
        
        if user["ansattID"] is not None:
            # Dette er en lege
            rolle = "lege"
            
            # Hent lege-info fra ansatt-tabellen
            cursor.execute("""
                SELECT ansattID, navn, mail 
                FROM ansatt 
                WHERE ansattID = ?
            """, (user["ansattID"],))
            
            lege = cursor.fetchone()
            brukerinfo = {
                "ansattID": lege["ansattID"],
                "navn": lege["navn"],
                "mail": lege["mail"]
            }
            
        elif user["fnr"] is not None:
            # Dette er en pasient
            rolle = "pasient"
            
            # Hent pasient-info fra pasient-tabellen
            cursor.execute("""
                SELECT pasientID, forNavn, etterNavn, fnr, tlf, adresse, epost 
                FROM pasient 
                WHERE fnr = ?
            """, (user["fnr"],))
            
            pasient = cursor.fetchone()
            brukerinfo = {
                "pasientID": pasient["pasientID"],
                "navn": f"{pasient['forNavn']} {pasient['etterNavn']}",
                "fnr": pasient["fnr"],
                "tlf": pasient["tlf"],
                "adresse": pasient["adresse"],
                "epost": pasient["epost"]
            }
        else:
            # Bruker har verken ansattID eller fnr - dette skal ikke skje!
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Brukerdata er ugyldig"
            )
        
        # 5. Lag JWT token med all relevant info
        token_data = {
            "userID": user["userID"],
            "brukernavn": user["brukernavn"],
            "rolle": rolle,
            "brukerinfo": brukerinfo
        }
        
        access_token = create_access_token(token_data)
        
        # 6. Returner token og brukerinfo
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            rolle=rolle,
            brukerinfo=brukerinfo
        )
        
    finally:
        connection.close()



