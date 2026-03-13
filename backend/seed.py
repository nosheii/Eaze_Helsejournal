# seed.py er for at vi skal slippe å manuelt legge inn testdata i database hver gang for alle som jobber på prosjektet
# Det er et skript som fyller databasen med testdata, og det kan kjøres flere ganger 
# uten å skape duplikater fordi det først sletter gamle testbrukere.
#Først må du slette den gamle databasen (i terminalen, rm app.db) for å unngå duplikater
# kjør python database.py i terminalen for å opprette tabellene på nytt, og deretter kjør 
# python seed.py for å fylle på med testdata. Husk å være i backend mappen og i ditt virtuelle miljø før du kjører disse kommandoene.

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

    # RYDD OPP GAMLE TESTDATA FØRST#
    # Rekkefølgen er viktig! Vi må slette i "riktig retning" av #
    # foreign key-relasjonene, barn før foreldre.                    #
    cursor.execute("DELETE FROM user WHERE brukernavn IN ('dr_hansen', 'dr_ghulam', '21267788', '123456', '987654')")
    cursor.execute("DELETE FROM ansatt WHERE mail IN ('hansen@eaze.no', 'ghulam@eaze.no')")
    cursor.execute("DELETE FROM pasient WHERE fnr IN ('21267788', '123456', '987654')")
    cursor.execute("DELETE FROM vaksine WHERE fnr IN ('21267788', '123456', '987654')")
    cursor.execute("DELETE FROM avtale WHERE fnr IN ('21267788', '123456', '987654')")
    print("✓ Ryddet opp gamle testdata")


    # ── DR. HANSEN ── #

    cursor.execute("""
        INSERT INTO ansatt (mail, navn)
        VALUES (?, ?)
    """, ("hansen@eaze.no", "Dr. Hansen"))
    ansatt_id_hansen = cursor.lastrowid
    print(f"✓ Opprettet lege: Dr. Hansen (ansattID: {ansatt_id_hansen})")

    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, ?, NULL)
    """, ("dr_hansen", hash_password("hemmelig123"), ansatt_id_hansen))
    print("✓ Opprettet bruker: dr_hansen / hemmelig123")


    # ── DR. GHULAM ── #

    cursor.execute("""
        INSERT INTO ansatt (mail, navn)
        VALUES (?, ?)
    """, ("ghulam@eaze.no", "Dr. Ghulam"))
    ansatt_id_ghulam = cursor.lastrowid
    print(f"✓ Opprettet lege: Dr. Ghulam (ansattID: {ansatt_id_ghulam})")

    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, ?, NULL)
    """, ("dr_ghulam", hash_password("hemmelig123"), ansatt_id_ghulam))
    print("✓ Opprettet bruker: dr_ghulam / hemmelig123")


    # ── MUMTAZ CADE ─── #

    cursor.execute("""
        INSERT INTO pasient (fnr, forNavn, etterNavn)
        VALUES (?, ?, ?)
    """, ("21267788", "Mumtaz", "Cade"))
    print("✓ Opprettet pasient: Mumtaz Cade (fnr: 21267788)")

    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, NULL, ?)
    """, ("21267788", hash_password("pasientMumtaz"), "21267788"))
    print("✓ Opprettet bruker: 21267788 / pasientMumtaz")


    # ── TILDA LØVOLD ─  #

    cursor.execute("""
        INSERT INTO pasient (fnr, forNavn, etterNavn)
        VALUES (?, ?, ?)
    """, ("123456", "Tilda", "Løvold"))
    print("✓ Opprettet pasient: Tilda Løvold (fnr: 123456)")

    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, NULL, ?)
    """, ("123456", hash_password("pasientTilda"), "123456"))
    print("✓ Opprettet bruker: 123456 / pasientTilda")


    # ── AURORA KROGSTAD ─── #

    cursor.execute("""
        INSERT INTO pasient (fnr, forNavn, etterNavn)
        VALUES (?, ?, ?)
    """, ("987654", "Aurora", "Krogstad"))
    print("✓ Opprettet pasient: Aurora Krogstad (fnr: 987654)")

    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, NULL, ?)
    """, ("987654", hash_password("pasientAurora"), "987654"))
    print("✓ Opprettet bruker: 987654 / pasientAurora")


    # ── VAKSINER ── #

    vaksiner_mumtaz = [
        ("HPV", "2021-06-10"),
        ("Influensa", "2019-01-10"),
        ("Covid-19", "2023-08-17"),
    ]
    for vaksineNavn, dato in vaksiner_mumtaz:
        cursor.execute("""
            INSERT INTO vaksine (fnr, vaksineNavn, dato, ansattID)
            VALUES (?, ?, ?, ?)
        """, ("21267788", vaksineNavn, dato, ansatt_id_hansen))
    print("✓ Opprettet testvaksiner for Mumtaz Cade")

    vaksiner_tilda = [
        ("Covid-19", "2022-03-15"),
        ("Influensa", "2023-10-05"),
        ("HPV", "2020-05-20"),
    ]
    for vaksineNavn, dato in vaksiner_tilda:
        cursor.execute("""
            INSERT INTO vaksine (fnr, vaksineNavn, dato, ansattID)
            VALUES (?, ?, ?, ?)
        """, ("123456", vaksineNavn, dato, ansatt_id_ghulam))
    print("✓ Opprettet testvaksiner for Tilda Løvold")

    vaksiner_aurora = [
        ("Influensa", "2024-01-08"),
        ("Covid-19", "2022-11-20"),
    ]
    for vaksineNavn, dato in vaksiner_aurora:
        cursor.execute("""
            INSERT INTO vaksine (fnr, vaksineNavn, dato, ansattID)
            VALUES (?, ?, ?, ?)
        """, ("987654", vaksineNavn, dato, ansatt_id_hansen))
    print("✓ Opprettet testvaksiner for Aurora Krogstad")


    # ── AVTALER ───  #
    # Mumtaz har 2 kommende og 6 tidligere , nok til at "se mer"-knappen vises #

    avtaler_mumtaz = [
        ("2026-09-12 12:00", "Helsesjekk",                    ansatt_id_hansen),
        ("2026-11-03 09:30", "Oppfølging etter blodprøve",    ansatt_id_hansen),
        ("2025-04-23 14:45", "Blodprøve",                     ansatt_id_hansen),
        ("2025-01-15 10:00", "Årlig kontroll",                 ansatt_id_hansen),
        ("2024-08-07 11:15", "Influensavaksine",               ansatt_id_ghulam),
        ("2024-05-20 09:00", "Kontroll etter operasjon",       ansatt_id_ghulam),
        ("2023-11-30 13:30", "Reseptfornyelse",                ansatt_id_hansen),
        ("2023-06-14 10:45", "Generell undersøkelse",          ansatt_id_ghulam),
    ]
    for tidspunkt, kommentar, lege_id in avtaler_mumtaz:
        cursor.execute("""
            INSERT INTO avtale (fnr, ansattID, tidspunkt, kommentar)
            VALUES (?, ?, ?, ?)
        """, ("21267788", lege_id, tidspunkt, kommentar))
    print("✓ Opprettet testavtaler for Mumtaz Cade (2 kommende, 6 tidligere)")

    avtaler_tilda = [
        ("2026-10-01 08:30", "Første konsultasjon",            ansatt_id_ghulam),
        ("2026-12-15 14:00", "Oppfølging kolesterol",          ansatt_id_hansen),
        ("2025-07-18 11:00", "Blodtrykk og kolesterol",        ansatt_id_ghulam),
        ("2025-03-05 09:30", "Reseptfornyelse",                ansatt_id_hansen),
        ("2024-12-03 14:00", "Årlig kontroll",                 ansatt_id_hansen),
        ("2024-06-22 10:15", "Influensavaksine",               ansatt_id_ghulam),
    ]
    for tidspunkt, kommentar, lege_id in avtaler_tilda:
        cursor.execute("""
            INSERT INTO avtale (fnr, ansattID, tidspunkt, kommentar)
            VALUES (?, ?, ?, ?)
        """, ("123456", lege_id, tidspunkt, kommentar))
    print("✓ Opprettet testavtaler for Tilda Løvold (2 kommende, 4 tidligere)")

    avtaler_aurora = [
        ("2026-08-22 10:00", "Ny pasient — innledende samtale", ansatt_id_hansen),
        ("2026-10-30 13:00", "Hudundersøkelse oppfølging",      ansatt_id_ghulam),
        ("2025-03-11 09:15", "Hudundersøkelse",                 ansatt_id_hansen),
        ("2024-09-04 11:30", "Blodprøve",                       ansatt_id_ghulam),
        ("2024-02-19 08:45", "Generell undersøkelse",           ansatt_id_hansen),
    ]
    for tidspunkt, kommentar, lege_id in avtaler_aurora:
        cursor.execute("""
            INSERT INTO avtale (fnr, ansattID, tidspunkt, kommentar)
            VALUES (?, ?, ?, ?)
        """, ("987654", lege_id, tidspunkt, kommentar))
    print("✓ Opprettet testavtaler for Aurora Krogstad (2 kommende, 3 tidligere)")


    connection.commit()
    connection.close()

    print("\n Seeding fullført!")
    print("\nTestbrukere:")
    print("  Leger:")
    print("    dr_hansen   / hemmelig123")
    print("    dr_ghulam   / hemmelig123")
    print("  Pasienter:")
    print("    21267788    / pasientMumtaz   (Mumtaz Cade)")
    print("    123456      / pasientTilda    (Tilda Løvold)")
    print("    987654      / pasientAurora   (Aurora Krogstad)")

if __name__ == "__main__":
    seed()