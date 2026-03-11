from multiprocessing.dummy import connection
from os import name
import sqlite3

def getConnection(): 
    connection = sqlite3.connect("app.db")  # Lager en tilkobling til SQLite-databasen
    connection.row_factory = sqlite3.Row  # Gjør at radene returneres som ordbøker, altså at man kan f.eks søke på kolonnenavn
    return connection #  Returnerer tilkoblingsobjektet


def init_db():
    connection = getConnection() 

    connection.execute( # Oppretter tabellen "ansatt" hvis den ikke allerede finnes
    """
    CREATE TABLE IF NOT EXISTS ansatt (
        ansattID INTEGER PRIMARY KEY AUTOINCREMENT,
        mail TEXT,
        navn TEXT
)
""")

    connection.execute( # Oppretter tabellen "pasient" hvis den ikke allerede finnes
    """
    CREATE TABLE IF NOT EXISTS pasient (
        pasientID INTEGER PRIMARY KEY AUTOINCREMENT, 
        forNavn TEXT, 
        etterNavn TEXT, 
        fnr TEXT, 
        tlf TEXT, 
        adresse TEXT, 
        epost TEXT
)
""")

    connection.execute("""
    CREATE TABLE IF NOT EXISTS user (
        userID INTEGER PRIMARY KEY AUTOINCREMENT,
        brukernavn TEXT UNIQUE NOT NULL,
        passord TEXT NOT NULL,
        ansattID INTEGER,
        fnr TEXT,
        FOREIGN KEY (ansattID) REFERENCES ansatt(ansattID)
)
""")
    
    connection.execute("""
    CREATE TABLE IF NOT EXISTS journal (
        journalNr INTEGER PRIMARY KEY AUTOINCREMENT,
        fnr TEXT NOT NULL,
        ansattID INTEGER NOT NULL,
        opprettetDato TEXT NOT NULL DEFAULT (date('now')),
        FOREIGN KEY (fnr) REFERENCES pasient(fnr),
        FOREIGN KEY (ansattID) REFERENCES ansatt(ansattID)
)
""")
    
    connection.execute("""
    CREATE TABLE IF NOT EXISTS diagnose (
        diagnoseID INTEGER PRIMARY KEY AUTOINCREMENT,
        journalNr INTEGER NOT NULL,
        kode TEXT NOT NULL,
        beskrivelse TEXT,
        FOREIGN KEY (journalNr) REFERENCES journal(journalNr)
)
""")

    connection.execute("""
    CREATE TABLE IF NOT EXISTS medikament ( 
        mediID INTEGER PRIMARY KEY AUTOINCREMENT, 
        mediNavn TEXT NOT NULL,
        doseEnhet TEXT NOT NULL
)
""")              
    
    connection.execute("""
    CREATE TABLE IF NOT EXISTS diagnose_medikament (
        diagnoseID INTEGER NOT NULL,
        mediID INTEGER NOT NULL,
        dose TEXT NOT NULL,
        varighet TEXT NOT NULL,
        PRIMARY KEY (diagnoseID, mediID),
        FOREIGN KEY (diagnoseID) REFERENCES diagnose(diagnoseID),
        FOREIGN KEY (mediID) REFERENCES medikament(mediID)
)
""")
    
    connection.execute("""
    CREATE TABLE IF NOT EXISTS dokument (
        dokumentID INTEGER PRIMARY KEY AUTOINCREMENT,
        journalNr INTEGER NOT NULL,
        ansattID INTEGER NOT NULL,
        opprettetDato TEXT NOT NULL DEFAULT (date('now')),
        tekst TEXT,
        FOREIGN KEY (journalNr) REFERENCES journal(journalNr),
        FOREIGN KEY (ansattID) REFERENCES ansatt(ansattID)
)
""")
    connection.execute("""
    CREATE TABLE IF NOT EXISTS melding (
        meldingID   INTEGER PRIMARY KEY AUTOINCREMENT,
        avsenderID  INTEGER NOT NULL,
        mottakerID  INTEGER NOT NULL,
        overskrift  TEXT NOT NULL,
        innhold     TEXT NOT NULL,
        sendt_dato  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lest        INTEGER DEFAULT 0,
        FOREIGN KEY (avsenderID) REFERENCES user(userID),
        FOREIGN KEY (mottakerID) REFERENCES user(userID)
)
""")
    connection.execute("""
    CREATE TABLE IF NOT EXISTS vaksine (
        vaksineID INTEGER PRIMARY KEY AUTOINCREMENT,
        vaksineNavn TEXT NOT NULL,
        fnr TEXT NOT NULL,
        dato TEXT NOT NULL,
        FOREIGN KEY (fnr) REFERENCES pasient(fnr)
)
""")
    
    connection.commit()
    connection.close()

    

if __name__ == "__main__":  
    init_db()  # Initialiserer databasen når skriptet kjøres direkte
    