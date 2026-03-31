from fastapi import FastAPI
from database import init_db, getConnection
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware 
from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
# "Vakten" som sjekker token
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ugyldig eller utløpt token"
        )

def krever_lege(bruker = Depends(verify_token)): # Avhengighet som sjekker at brukeren er en lege
    if bruker.get("rolle") != "lege":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du har ikke tilgang til denne ressursen"
        )
    return bruker



app = FastAPI() # Oppretter en FastAPI-applikasjon
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]) # Legger til CORS-middleware for å tillate forespørsler fra alle opprinnelser
init_db() # Initialiserer databasen ved oppstart av applikasjonen

@app.get("/debug/meg")
def debug_meg(bruker = Depends(verify_token)):
    # Returnerer hele payload-objektet fra tokenet for å kunne debuge ved feil
    return {"token_innhold": dict(bruker)}

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

class JournalRequest(BaseModel): # Modell for å opprette en journal, inneholder fnr til pasienten og ansattID til legen som oppretter journalen
    fnr: str

class VaksineRequest(BaseModel):
    fnr: str
    vaksineNavn: str
    dato: str

class DokumentRequest(BaseModel):
    journalNr: int
    tekst: str

class MeldingRequest(BaseModel):
    mottakerID: int
    overskrift: str
    innhold: str

class AvtaleRequest(BaseModel):
    fnr: str
    tidspunkt: str
    kommentar: str = None

class AvtaleOppdaterRequest(BaseModel):
    tidspunkt: str
    kommentar: str = None

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

@app.get("/brukere/søk") # Endpoint for å søke etter pasienter basert på navn,
    #krever at brukeren er en lege (krever_lege). Denne brukes i innboks søkefunksjonen 
def søk_brukere(navn: str, bruker = Depends(krever_lege)):
    """" Søker etter pasienter basert på navn. Dette er kun tilgjengelig for leger.
    Her brukes en SQL-spørring med LIKE for å finne pasienter der fornavn eller etternavn matcher søket.
    """
    connection = getConnection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT
                u.userID,
                p.forNavn || ' ' || p.etterNavn as navn,
                p.fnr
            FROM user u
            JOIN pasient p ON u.fnr = p.fnr
            WHERE (p.forNavn || ' ' || p.etterNavn) LIKE ?
            ORDER BY p.etterNavn ASC
        """, (f"%{navn}%",))

        resultater = cursor.fetchall()
        return {"resultater": [dict(r) for r in resultater]}
    finally:
        connection.close()

@app.get("/brukere/mine-leger") # Endpoint for å hente alle leger som har hatt avtaler med innlogget pasient
def hent_mine_leger(bruker = Depends(verify_token)):
    connection = getConnection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT DISTINCT
                u.userID,
                a.navn
            FROM avtale av
            JOIN ansatt a ON av.ansattID = a.ansattID
            JOIN user u ON u.ansattID = a.ansattID
            WHERE av.fnr = ?
        """, (bruker["brukerinfo"]["fnr"],))

        resultater = cursor.fetchall()
        return {"resultater": [dict(r) for r in resultater]}
    finally:
        connection.close()

@app.get("/avtaler/mine")
def hent_mine_avtaler(bruker = Depends(krever_lege)):
    connection = getConnection()
    cursor = connection.cursor()
    #Endpoint for å hente alle avtaler der innlogget lege er ansattID.
    #Joiner pasient tabellen for å få med pasientens navn i responsen, sånn at vi slipper
    #å gjøre en ekstra request fra frontend for å hente pasientnavnet basert på fnr for hver avtale
    try: 
        cursor.execute(""" 
            SELECT
                a.avtaleID,
                a.fnr,
                a.tidspunkt,
                a.kommentar,
                p.forNavn || ' ' || p.etterNavn as pasientNavn
            FROM avtale a
            LEFT JOIN pasient p ON a.fnr = p.fnr
            WHERE a.ansattID = ?
            ORDER BY a.tidspunkt ASC
        """, (bruker["brukerinfo"]["ansattID"],))

        avtaler = cursor.fetchall()
        return {"avtaler": [dict(a) for a in avtaler]}
    finally:
        connection.close()

@app.get("/avtaler/pasient")
def hent_pasient_avtaler(bruker = Depends(verify_token)):
    connection = getConnection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT
                a.avtaleID,
                a.fnr,
                a.tidspunkt,
                a.kommentar,
                ans.navn as legeNavn
            FROM avtale a
            LEFT JOIN ansatt ans ON a.ansattID = ans.ansattID
            WHERE a.fnr = ?
            ORDER BY a.tidspunkt ASC
        """, (bruker["brukerinfo"]["fnr"],))
        avtaler = cursor.fetchall()
        return {"avtaler": [dict(a) for a in avtaler]}
    finally:
        connection.close()

@app.get("/avtaler/{fnr}")
def hent_avtaler(fnr: str, bruker = Depends(verify_token)):
    if bruker.get("rolle") == "pasient":
        if bruker.get("brukerinfo", {}).get("fnr") != fnr:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Du kan bare se dine egne avtaler"
            )
    connection = getConnection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT
                a.avtaleID,
                a.tidspunkt,
                a.kommentar,
                ans.navn as legeNavn
            FROM avtale a
            LEFT JOIN ansatt ans ON a.ansattID = ans.ansattID
            WHERE a.fnr = ?
            ORDER BY a.tidspunkt ASC
        """, (fnr,))
        avtaler = cursor.fetchall()
        return {"avtaler": [dict(a) for a in avtaler]}
    finally:
        connection.close()

@app.post("/avtaler") # Oppretter en ny avtale, krever at brukeren er en lege
def opprett_avtale(avtale_data: AvtaleRequest, bruker = Depends(krever_lege)):
    connection = getConnection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            INSERT INTO avtale (fnr, ansattID, tidspunkt, kommentar)
            VALUES (?, ?, ?, ?)
        """, (
            avtale_data.fnr,
            bruker["brukerinfo"]["ansattID"],
            avtale_data.tidspunkt,
            avtale_data.kommentar
        ))
        connection.commit()
        return {"status": "Avtale opprettet!", "avtaleID": cursor.lastrowid}

    finally:
        connection.close()

@app.put("/avtaler/{avtaleID}") # Endrer en eksisterende avtale, krever at brukeren er en lege
def oppdater_avtale(avtaleID: int, avtale_data: AvtaleOppdaterRequest, bruker = Depends(krever_lege)):
    connection = getConnection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            UPDATE avtale
            SET tidspunkt = ?, kommentar = ?
            WHERE avtaleID = ?
        """, (
            avtale_data.tidspunkt,
            avtale_data.kommentar,
            avtaleID
        ))
        connection.commit()
        return {"status": "Avtale oppdatert!"}

    finally:
        connection.close()

@app.delete("/avtaler/{avtaleID}") # Sletter en avtale, krever at brukeren er en lege
def slett_avtale(avtaleID: int, bruker = Depends(krever_lege)):
    connection = getConnection()
    cursor = connection.cursor()

    try:
        cursor.execute("DELETE FROM avtale WHERE avtaleID = ?", (avtaleID,))
        connection.commit()
        return {"status": "Avtale slettet!"}

    finally:
        connection.close()

@app.get("/journal") # Endpoint for å hente alle journaler, krever at brukeren er en lege (krever_lege)
def hent_alle_journaler(bruker = Depends(krever_lege)):
    connection = getConnection()
    cursor = connection.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                j.journalNr,
                j.fnr,
                j.opprettetDato,
                p.forNavn,
                p.etterNavn,
                a.navn as legeNavn
            FROM journal j
            LEFT JOIN pasient p ON j.fnr = p.fnr
            LEFT JOIN ansatt a ON j.ansattID = a.ansattID
            ORDER BY j.opprettetDato DESC
        """)
        
        journaler = cursor.fetchall()
        return {"journaler": [dict(j) for j in journaler]} 
        
    finally:
        connection.close()

@app.get("/journal/{fnr}") # Endpoint for å hente journaler for en spesifikk pasient basert på fødselsnummer (fnr), krever at brukeren er enten legen selv eller pasienten det gjelder
def hent_journal_for_pasient(fnr: str, bruker = Depends(verify_token)):
    # Pasient kan bare se sin egen journal
    if bruker.get("rolle") == "pasient":
        if bruker.get("brukerinfo", {}).get("fnr") != fnr:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Du kan bare se din egen journal"
            )
    
    connection = getConnection()
    cursor = connection.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                j.journalNr,
                j.fnr,
                j.opprettetDato,
                a.navn as legeNavn,
                p.forNavn,
                p.etterNavn
            FROM journal j
            LEFT JOIN ansatt a ON j.ansattID = a.ansattID
            LEFT JOIN pasient p ON j.fnr = p.fnr
            WHERE j.fnr = ?
            ORDER BY j.opprettetDato DESC
        """, (fnr,))
        
        journaler = cursor.fetchall()
        return {"journaler": [dict(j) for j in journaler]}
        
    finally:
        connection.close()


@app.post("/journal") # Endpoint for å opprette en ny journal, krever at brukeren er en lege (krever_lege)
def opprett_journal(journal_data: JournalRequest, bruker = Depends(krever_lege)):
    connection = getConnection()
    cursor = connection.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO journal (fnr, ansattID)
            VALUES (?, ?)
        """, (
            journal_data.fnr,
            bruker["brukerinfo"]["ansattID"]
        ))
        
        journal_nr = cursor.lastrowid
        connection.commit()
        
        return {
            "status": "Journal opprettet!",
            "journalNr": journal_nr
        }
        
    finally:
        connection.close()

@app.post("/dokument") # Endpoint for å opprette et nytt dokument i en journal, krever at brukeren er en lege (krever_lege)
def opprett_dokument(dokument_data: DokumentRequest, bruker = Depends(krever_lege)):
    connection = getConnection()
    cursor = connection.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO dokument (journalNr, ansattID, tekst)
            VALUES (?, ?, ?)
        """, (
            dokument_data.journalNr,
            bruker["brukerinfo"]["ansattID"],
            dokument_data.tekst
        ))
        
        connection.commit()
        
        return {
            "status": "Dokument opprettet!",
            "dokumentID": cursor.lastrowid
        }
        
    finally:
        connection.close()

@app.get("/dokument/{journalNr}") # Endpoint for å hente alle dokumenter i en journal, krever at brukeren er enten legen selv eller pasienten det gjelder
def hent_dokumenter(journalNr: int, bruker = Depends(verify_token)):
    connection = getConnection()
    cursor = connection.cursor()
    
    try:
        # Sjekk om pasienten har tilgang til denne journalen
        if bruker.get("rolle") == "pasient":
            cursor.execute("""
                SELECT fnr FROM journal WHERE journalNr = ?
            """, (journalNr,))
            
            journal = cursor.fetchone()
            
            if not journal or journal["fnr"] != bruker.get("brukerinfo", {}).get("fnr"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Du har ikke tilgang til dette dokumentet"
                )
        
        # Hent dokumenter
        cursor.execute("""
            SELECT 
                d.dokumentID,
                d.opprettetDato,
                d.tekst,
                a.navn as legeNavn
            FROM dokument d
            LEFT JOIN ansatt a ON d.ansattID = a.ansattID
            WHERE d.journalNr = ?
            ORDER BY d.opprettetDato DESC
        """, (journalNr,))
        
        dokumenter = cursor.fetchall()
        return {"dokumenter": [dict(d) for d in dokumenter]}
        
    finally:
        connection.close()

@app.get("/vaksine/{fnr}") # henter vaksiner fra fødselsnummer
def hent_vaksine(fnr: str, bruker = Depends(verify_token)):
    if bruker.get("rolle") == "pasient":
        if bruker.get("brukerinfo", {}).get("fnr") != fnr:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Du kan bare se dine egne vaksiner"
            )
    connection = getConnection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            SELECT 
                v.vaksineID,
                v.vaksineNavn,
                v.dato,
                a.navn as legeNavn
            FROM vaksine v
            LEFT JOIN ansatt a ON v.ansattID = a.ansattID
            WHERE v.fnr = ?
            ORDER BY v.dato DESC
        """, (fnr,))
        
        vaksine = cursor.fetchall()
        return {"vaksine": [dict(v) for v in vaksine]}
    
    finally:
        connection.close()

@app.post("/vaksine") # oppretter vaksine
def ny_vaksine(vaksine_data: VaksineRequest, bruker = Depends(krever_lege)):
    connection = getConnection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            INSERT INTO vaksine (fnr, vaksineNavn, dato, ansattID)
            VALUES (?, ?, ?, ?)
        """, (
            vaksine_data.fnr,
            vaksine_data.vaksineNavn,
            vaksine_data.dato,
            bruker["brukerinfo"]["ansattID"]
        ))
        
        connection.commit()
        return {
            "status": "Vaksine opprettet!",
            "vaksineID": cursor.lastrowid
        }
    
    finally:
        connection.close()

class PasientInfoRequest(BaseModel):
    om_pasient: List[str]
    kritisk_info: List[str]

@app.get("/pasient/{fnr}/info")
def hent_pasient_info(fnr: str, bruker = Depends(verify_token)):
    if bruker.get("rolle") == "pasient":
        if bruker.get("brukerinfo", {}).get("fnr") != fnr:
            raise HTTPException(status_code=403, detail="Du kan bare se din egen info")
    
    connection = getConnection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "SELECT kategori, innhold FROM pasient_info WHERE fnr = ?", (fnr,)
        )
        rader = cursor.fetchall()
        return {
            "om_pasient":   [r["innhold"] for r in rader if r["kategori"] == "om_pasient"],
            "kritisk_info": [r["innhold"] for r in rader if r["kategori"] == "kritisk_info"]
        }
    finally:
        connection.close()

@app.put("/pasient/{fnr}/info")
def oppdater_pasient_info(fnr: str, data: PasientInfoRequest, bruker = Depends(krever_lege)):
    connection = getConnection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM pasient_info WHERE fnr = ?", (fnr,))
        for innhold in data.om_pasient:
            cursor.execute(
                "INSERT INTO pasient_info (fnr, kategori, innhold) VALUES (?, 'om_pasient', ?)",
                (fnr, innhold)
            )
        for innhold in data.kritisk_info:
            cursor.execute(
                "INSERT INTO pasient_info (fnr, kategori, innhold) VALUES (?, 'kritisk_info', ?)",
                (fnr, innhold)
            )
        connection.commit()
        return {"status": "ok"}
    finally:
        connection.close()

@app.get("/meldinger/sendt")
def hent_sendte_meldinger(bruker = Depends(verify_token)):
    connection = getConnection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT
                m.meldingID,
                m.overskrift,
                m.innhold,
                m.sendt_dato,
                m.lest,
                m.avsenderID,
                COALESCE(a.navn, p.forNavn || ' ' || p.etterNavn) as mottaker_navn
            FROM melding m
            JOIN user u ON m.mottakerID = u.userID
            LEFT JOIN ansatt a ON u.ansattID = a.ansattID
            LEFT JOIN pasient p ON u.fnr = p.fnr
            WHERE m.avsenderID = ?
            ORDER BY m.sendt_dato DESC
        """, (bruker["userID"],))

        meldinger = cursor.fetchall()
        return {"meldinger": [dict(m) for m in meldinger]}
    finally:
        connection.close()

@app.get("/meldinger/sendt")
def hent_sendte_meldinger(bruker = Depends(verify_token)):
    """
    Her henter jeg alle meldinger som pålogget bruker har sendt.
    Jeg joiner både ansatt og pasient tabellen, for å vise mottakerens navn i respons
    Uansett om det er lege eller pasient
    Så slipper frontend å gjøre en ekstra request for å hente mottaker navn basert på userid

    """
    connection = getConnection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT
                m.meldingID,
                m.overskrift,
                m.innhold,
                m.sendt_dato,
                m.lest,
                m.avsenderID,
                COALESCE(a.navn, p.forNavn || ' ' || p.etterNavn) as mottaker_navn
            FROM melding m
            JOIN user u ON m.mottakerID = u.userID
            LEFT JOIN ansatt a ON u.ansattID = a.ansattID
            LEFT JOIN pasient p ON u.fnr = p.fnr
            WHERE m.avsenderID = ?
            ORDER BY m.sendt_dato DESC
        """, (bruker["userID"],))

        meldinger = cursor.fetchall()
        return {"meldinger": [dict(m) for m in meldinger]}
    finally:
        connection.close()

@app.get("/meldinger")
def hent_meldinger(bruker = Depends(verify_token)):
    """
    Henter alle meldinger der innlogget bruker er mottaker.
    Backend filtrerer selv basert på hvem som er logget inn —
    frontend trenger ikke å sende med rolle eller userID manuelt.
    
    COALESCE betyr "bruk den første verdien som ikke er NULL".
    Vi bruker det fordi avsenderen kan være enten en lege (navn fra ansatt-tabellen)
    eller en pasient (navn fra pasient-tabellen), og vi vil alltid få ett navn tilbake.
    """
    connection = getConnection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            SELECT
                m.meldingID,
                m.overskrift,
                m.innhold,
                m.sendt_dato,
                m.lest,
                m.avsenderID,
                COALESCE(a.navn, p.forNavn || ' ' || p.etterNavn) as avsender_navn
            FROM melding m
            JOIN user u ON m.avsenderID = u.userID
            LEFT JOIN ansatt a ON u.ansattID = a.ansattID
            LEFT JOIN pasient p ON u.fnr = p.fnr
            WHERE m.mottakerID = ?
            ORDER BY m.sendt_dato DESC
        """, (bruker["userID"],))

        meldinger = cursor.fetchall()
        return {"meldinger": [dict(m) for m in meldinger]}

    finally:
        connection.close()


@app.post("/meldinger")
def send_melding(melding_data: MeldingRequest, bruker = Depends(verify_token)):
    """
    Sender en ny melding. AvsenderID hentes fra tokenet automatisk,
    så frontend kan ikke forfalske hvem meldingen er fra.
    """
    connection = getConnection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            INSERT INTO melding (avsenderID, mottakerID, overskrift, innhold)
            VALUES (?, ?, ?, ?)
        """, (
            bruker["userID"],
            melding_data.mottakerID,
            melding_data.overskrift,
            melding_data.innhold
        ))
        connection.commit()
        return {"status": "Melding sendt!", "meldingID": cursor.lastrowid}

    finally:
        connection.close()


@app.patch("/meldinger/{meldingID}/lest")
def merk_som_lest(meldingID: int, bruker = Depends(verify_token)):
    """
    Markerer en melding som lest.
    Vi sjekker alltid at det er mottakeren selv som gjør dette 
    du skal ikke kunne markere andres meldinger som lest.
    """
    connection = getConnection()
    cursor = connection.cursor()

    try:
        # Sikkerhetsjekk: tilhører denne meldingen den innloggede brukeren?
        cursor.execute("SELECT mottakerID FROM melding WHERE meldingID = ?", (meldingID,))
        melding = cursor.fetchone()

        if not melding or melding["mottakerID"] != bruker["userID"]:
            raise HTTPException(status_code=403, detail="Ikke din melding")

        cursor.execute("UPDATE melding SET lest = 1 WHERE meldingID = ?", (meldingID,))
        connection.commit()
        return {"status": "Merket som lest"}

    finally:
        connection.close()

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



