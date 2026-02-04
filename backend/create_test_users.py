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
    
    # 1. Lag en test-lege i ansatt-tabellen
    cursor.execute("""
        INSERT INTO ansatt (mail, navn)
        VALUES (?, ?)
    """, ("hansen@eaze.no", "Dr. Hansen"))
    
    ansatt_id = cursor.lastrowid  # Henter ID-en til legen vi nettopp la til
    print(f"✓ Opprettet lege: Dr. Hansen (ansattID: {ansatt_id})")
    
    # 2. Hash passordet
    hashed_password = hash_password("hemmelig123")
    print(f"✓ Hashet passord: {hashed_password[:50]}...")  # Viser bare starten
    
    # 3. Lag bruker for legen i user-tabellen
    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, ?, ?)
    """, ("dr_hansen", hashed_password, ansatt_id, None))
    
    print(f"✓ Opprettet bruker: dr_hansen")
    
    connection.commit()
    connection.close()
    
    print("\n✅ Test-data opprettet!")
    print("\nDu kan nå logge inn med:")
    print("  Brukernavn: dr_hansen")
    print("  Passord: hemmelig123")

if __name__ == "__main__":
    create_test_users()