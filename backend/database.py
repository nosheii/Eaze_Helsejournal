import sqlite3

def getConnection(): 
    connection = sqlite3.connect("app.db")  # Lager en tilkobling til SQLite-databasen
    connection.row_factory = sqlite3.Row  # Gjør at radene returneres som ordbøker, altså at man kan f.eks søke på kolonnenavn
    return connection #  Returnerer tilkoblingsobjektet


def init_db():
    connection = getConnection() 
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
    connection.commit() # Lagre endringene i databasen
    connection.close()

