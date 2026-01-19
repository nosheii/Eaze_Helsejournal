from fastapi import FastAPI
from database import init_db, getConnection
from pydantic import BaseModel

app = FastAPI()
init_db()

@app.get("/")
async def root():
    return {"message": "Hello World"}

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
