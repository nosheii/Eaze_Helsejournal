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
    """
    )

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
    connection.commit()
    connection.close()

    

if __name__ == "__main__":  
    init_db()  # Initialiserer databasen når skriptet kjøres direkte
    