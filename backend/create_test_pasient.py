import sqlite3
from passlib.context import CryptContext

# Sett opp passord-hashing med argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")



def hash_password(password: str) -> str:
    """Hasher et passord med bcrypt"""
    return pwd_context.hash(password)

def create_test_users():
    connection = sqlite3.connect("app.db")
    cursor = connection.cursor()
    
    print("Lager test-data...")

    cursor.execute("DELETE FROM user WHERE brukernavn = 'Mumtaz' OR brukernavn = '21267788'")
    cursor.execute("DELETE FROM pasient WHERE fNr = '21267788'")
    
    # 1. Lag en test-pasient i pasient-tabellen
    cursor.execute("""
        INSERT INTO pasient (fNr, forNavn, etterNavn)
        VALUES (?, ?, ?)
    """, ("21267788", "Mumtaz", "Cade"))
    
    pasientID = cursor.lastrowid  # Henter ID-en til pasienten vi nettopp la til
    print(f"✓ Opprettet pasient: Mumtaz Cade (pasientID: {pasientID})")
    
    # 2. Hash passordet
    hashed_password = hash_password("pasientMumtaz")
    print(f"✓ Hashet passord: {hashed_password[:50]}...")  # Viser bare starten
    
    # 3. Lag bruker for pasienten i user-tabellen
    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fNr)
        VALUES (?, ?, ?, ?)
    """, ("21267788", hashed_password, None, "21267788"))
    
    print(f"✓ Opprettet bruker: Mumtaz")
    
    connection.commit()
    connection.close()
    
    print("\n✅ Test-data opprettet!")
    print("\nDu kan nå logge inn med:")
    print("  Brukernavn: 21267788")
    print("  Passord: pasientMumtaz")

if __name__ == "__main__":
    create_test_users()