# seed.py er for at vi skal slippe å manuelt legge inn testdata i database hver gang for alle som jobber på prosjektet
# Det er et skript som fyller databasen med testdata, og det kan kjøres flere ganger uten å skape duplikater fordi det først sletter gamle testbrukere.
#Først må du slette den gamle databasen (i terminalen, rm app.db) for å unngå duplikater
# kjør python database.py i terminalen for å opprette tabellene på nytt, og deretter kjør 
# python seed.py for å fylle på med testdata. Husk å være i backend mappen og i ditt virtuelle miljø før du kjører disse kommandoene.
# Dette skriptet fyller databasen med testdata.
# Kjør det etter init_db() har opprettet tabellene:
#   python seed.py
# Du kan trygt kjøre dette flere ganger — det sletter gamle testbrukere
# først, slik at du aldri får duplikater.

import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def seed():
    connection = sqlite3.connect("app.db")
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    print(" Starter seeding av testdata...\n")


    # RYDD OPP GAMLE TESTDATA FØRST                                       #
    # Rekkefølgen her er viktig! Vi må slette i "riktig retning" av       #
    # foreign key-relasjonene — barn før foreldre.                        #
    # user peker på ansatt og pasient, så user slettes først.            #
    cursor.execute("DELETE FROM user WHERE brukernavn IN ('dr_hansen', '21267788')")
    cursor.execute("DELETE FROM ansatt WHERE mail = 'hansen@eaze.no'")
    cursor.execute("DELETE FROM pasient WHERE fnr = '21267788'")
    print("✓ Ryddet opp gamle testdata")


    # legger inn testlegen: Dr. Hansen                                                #

    cursor.execute("""
        INSERT INTO ansatt (mail, navn)
        VALUES (?, ?)
    """, ("hansen@eaze.no", "Dr. Hansen"))

    ansatt_id = cursor.lastrowid
    print(f"✓ Opprettet lege: Dr. Hansen (ansattID: {ansatt_id})")

    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, ?, NULL)
    """, ("dr_hansen", hash_password("hemmelig123"), ansatt_id))
    print("✓ Opprettet bruker: dr_hansen / hemmelig123")


    # legger inn testpasient: Mumtaz Cade #
    # vi bruker fnr (lowercase) konsekvent her for å matche #
    # resten av databaseoppsettet i database.py og main.py #

    cursor.execute("""
        INSERT INTO pasient (fnr, forNavn, etterNavn)
        VALUES (?, ?, ?)
    """, ("21267788", "Mumtaz", "Cade"))

    print(f"✓ Opprettet pasient: Mumtaz Cade (fnr: 21267788)")

    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, NULL, ?)
    """, ("21267788", hash_password("pasientMumtaz"), "21267788"))
    print("✓ Opprettet bruker: 21267788 / pasientMumtaz")

    connection.commit()
    connection.close()

    print("\n Seeding fullført!")
    print("\nTestbrukere:")
    print("  Lege    — brukernavn: dr_hansen      passord: hemmelig123")
    print("  Pasient — brukernavn: 21267788       passord: pasientMumtaz")

if __name__ == "__main__":
    seed()