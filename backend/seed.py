# seed.py er for at vi skal slippe å manuelt legge inn testdata i database hver gang for alle som jobber på prosjektet
# Det er et skript som fyller databasen med testdata, og det kan kjøres flere ganger 
# uten å skape duplikater fordi det først sletter gamle testbrukere.
# Først må du slette den gamle databasen (i terminalen, rm app.db) for å unngå duplikater
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

    # Rydd opp gamle testdata først.
    # Rekkefølgen er viktig, må slette i riktig retning av
    # foreign key relasjonene, barn før foreldre.
    # user peker på ansatt og pasient, så user slettes først.
    cursor.execute("DELETE FROM melding WHERE avsenderID IN (SELECT userID FROM user WHERE brukernavn IN ('dr_hansen', 'dr_ghulam', '14038512345', '22079812346', '05119212347'))")
    cursor.execute("DELETE FROM melding WHERE mottakerID IN (SELECT userID FROM user WHERE brukernavn IN ('dr_hansen', 'dr_ghulam', '14038512345', '22079812346', '05119212347'))")
    cursor.execute("DELETE FROM user WHERE brukernavn IN ('dr_hansen', 'dr_ghulam', '14038512345', '22079812346', '05119212347')")
    cursor.execute("DELETE FROM dokument WHERE journalNr IN (SELECT journalNr FROM journal WHERE fnr IN ('14038512345', '22079812346', '05119212347'))")
    cursor.execute("DELETE FROM diagnose WHERE journalNr IN (SELECT journalNr FROM journal WHERE fnr IN ('14038512345', '22079812346', '05119212347'))")
    cursor.execute("DELETE FROM journal WHERE fnr IN ('14038512345', '22079812346', '05119212347')")
    cursor.execute("DELETE FROM ansatt WHERE mail IN ('hansen@eaze.no', 'ghulam@eaze.no')")
    cursor.execute("DELETE FROM pasient WHERE fnr IN ('14038512345', '22079812346', '05119212347')")
    cursor.execute("DELETE FROM vaksine WHERE fnr IN ('14038512345', '22079812346', '05119212347')")
    cursor.execute("DELETE FROM avtale WHERE fnr IN ('14038512345', '22079812346', '05119212347')")
    cursor.execute("DELETE FROM pasient_info WHERE fnr IN ('14038512345', '22079812346', '05119212347')")
    print("✓ Ryddet opp gamle testdata")


    # Dr. Hansen opprettes
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


    # Dr. Ghulam opprettes
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


    # Mumtaz Cade opprettes som pasient (født 14.03.1985)
    cursor.execute("""
        INSERT INTO pasient (fnr, forNavn, etterNavn)
        VALUES (?, ?, ?)
    """, ("14038512345", "Mumtaz", "Cade"))
    print("✓ Opprettet pasient: Mumtaz Cade (fnr: 14038512345)")

    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, NULL, ?)
    """, ("14038512345", hash_password("pasientMumtaz"), "14038512345"))
    print("✓ Opprettet bruker: 14038512345 / pasientMumtaz")


    # Tilda Løvold opprettes som pasient (født 22.07.1998)
    cursor.execute("""
        INSERT INTO pasient (fnr, forNavn, etterNavn)
        VALUES (?, ?, ?)
    """, ("22079812346", "Tilda", "Løvold"))
    print("✓ Opprettet pasient: Tilda Løvold (fnr: 22079812346)")

    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, NULL, ?)
    """, ("22079812346", hash_password("pasientTilda"), "22079812346"))
    print("✓ Opprettet bruker: 22079812346 / pasientTilda")


    # Aurora Krogstad opprettes som pasient (født 05.11.1992)
    cursor.execute("""
        INSERT INTO pasient (fnr, forNavn, etterNavn)
        VALUES (?, ?, ?)
    """, ("05119212347", "Aurora", "Krogstad"))
    print("✓ Opprettet pasient: Aurora Krogstad (fnr: 05119212347)")

    cursor.execute("""
        INSERT INTO user (brukernavn, passord, ansattID, fnr)
        VALUES (?, ?, NULL, ?)
    """, ("05119212347", hash_password("pasientAurora"), "05119212347"))
    print("✓ Opprettet bruker: 05119212347 / pasientAurora")


    # Hent userID-er for å kunne sende meldinger mellom brukere
    cursor.execute("SELECT userID FROM user WHERE brukernavn = 'dr_hansen'")
    user_id_hansen = cursor.fetchone()["userID"]

    cursor.execute("SELECT userID FROM user WHERE brukernavn = 'dr_ghulam'")
    user_id_ghulam = cursor.fetchone()["userID"]

    cursor.execute("SELECT userID FROM user WHERE brukernavn = '14038512345'")
    user_id_mumtaz = cursor.fetchone()["userID"]

    cursor.execute("SELECT userID FROM user WHERE brukernavn = '22079812346'")
    user_id_tilda = cursor.fetchone()["userID"]

    cursor.execute("SELECT userID FROM user WHERE brukernavn = '05119212347'")
    user_id_aurora = cursor.fetchone()["userID"]


    # En journal til hver pasient
    cursor.execute("""
        INSERT INTO journal (fnr, ansattID, opprettetDato)
        VALUES (?, ?, ?)
    """, ("14038512345", ansatt_id_hansen, "2023-01-10"))
    journal_nr_mumtaz = cursor.lastrowid
    print(f"✓ Opprettet journal for Mumtaz Cade (journalNr: {journal_nr_mumtaz})")

    cursor.execute("""
        INSERT INTO journal (fnr, ansattID, opprettetDato)
        VALUES (?, ?, ?)
    """, ("22079812346", ansatt_id_ghulam, "2023-03-15"))
    journal_nr_tilda = cursor.lastrowid
    print(f"✓ Opprettet journal for Tilda Løvold (journalNr: {journal_nr_tilda})")

    cursor.execute("""
        INSERT INTO journal (fnr, ansattID, opprettetDato)
        VALUES (?, ?, ?)
    """, ("05119212347", ansatt_id_hansen, "2024-02-19"))
    journal_nr_aurora = cursor.lastrowid
    print(f"✓ Opprettet journal for Aurora Krogstad (journalNr: {journal_nr_aurora})")


    # Vaksiner for Mumtaz
    vaksiner_mumtaz = [
        ("HPV", "2021-06-10"),
        ("Influensa", "2019-01-10"),
        ("Covid-19", "2023-08-17"),
    ]
    for vaksineNavn, dato in vaksiner_mumtaz:
        cursor.execute("""
            INSERT INTO vaksine (fnr, vaksineNavn, dato, ansattID)
            VALUES (?, ?, ?, ?)
        """, ("14038512345", vaksineNavn, dato, ansatt_id_hansen))
    print("✓ Opprettet testvaksiner for Mumtaz Cade")

    # Vaksiner for Tilda
    vaksiner_tilda = [
        ("Covid-19", "2022-03-15"),
        ("Influensa", "2023-10-05"),
        ("HPV", "2020-05-20"),
    ]
    for vaksineNavn, dato in vaksiner_tilda:
        cursor.execute("""
            INSERT INTO vaksine (fnr, vaksineNavn, dato, ansattID)
            VALUES (?, ?, ?, ?)
        """, ("22079812346", vaksineNavn, dato, ansatt_id_ghulam))
    print("✓ Opprettet testvaksiner for Tilda Løvold")

    # Vaksiner for Aurora
    vaksiner_aurora = [
        ("Influensa", "2024-01-08"),
        ("Covid-19", "2022-11-20"),
    ]
    for vaksineNavn, dato in vaksiner_aurora:
        cursor.execute("""
            INSERT INTO vaksine (fnr, vaksineNavn, dato, ansattID)
            VALUES (?, ?, ?, ?)
        """, ("05119212347", vaksineNavn, dato, ansatt_id_hansen))
    print("✓ Opprettet testvaksiner for Aurora Krogstad")


    # Avtaler for Mumtaz
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
        """, ("14038512345", lege_id, tidspunkt, kommentar))
    print("✓ Opprettet testavtaler for Mumtaz Cade (2 kommende, 6 tidligere)")

    # Avtaler for Tilda
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
        """, ("22079812346", lege_id, tidspunkt, kommentar))
    print("✓ Opprettet testavtaler for Tilda Løvold (2 kommende, 4 tidligere)")

    # Avtaler for Aurora
    avtaler_aurora = [
        ("2026-08-22 10:00", "Ny pasient innledende samtale",  ansatt_id_hansen),
        ("2026-10-30 13:00", "Hudundersøkelse oppfølging",     ansatt_id_ghulam),
        ("2025-03-11 09:15", "Hudundersøkelse",                ansatt_id_hansen),
        ("2024-09-04 11:30", "Blodprøve",                      ansatt_id_ghulam),
        ("2024-02-19 08:45", "Generell undersøkelse",          ansatt_id_hansen),
    ]
    for tidspunkt, kommentar, lege_id in avtaler_aurora:
        cursor.execute("""
            INSERT INTO avtale (fnr, ansattID, tidspunkt, kommentar)
            VALUES (?, ?, ?, ?)
        """, ("05119212347", lege_id, tidspunkt, kommentar))
    print("✓ Opprettet testavtaler for Aurora Krogstad (2 kommende, 3 tidligere)")


    # Testmeldinger
    meldinger = [
        (user_id_hansen, user_id_mumtaz,  "Oppfølging etter blodprøve",    "Hei Mumtaz, blodprøvene dine viser normale verdier. Ingen videre tiltak er nødvendig, men vi anbefaler en ny kontroll om seks måneder. Ta gjerne kontakt hvis du har spørsmål."),
        (user_id_hansen, user_id_mumtaz,  "Resept fornyet",                 "Hei, jeg har nå fornyet resepten din på Paracet. Den er klar til henting på apoteket fra i morgen. Husk å ta medisinen som foreskrevet."),
        (user_id_mumtaz, user_id_hansen,  "Spørsmål om medisin",            "Hei Dr. Hansen, jeg har merket at jeg blir litt svimmel etter å ha tatt den nye medisinen. Er dette normalt, eller bør jeg komme inn til en time?"),
        (user_id_ghulam, user_id_tilda,   "Resultater fra siste kontroll",  "Hei Tilda, kolesterolverdiene dine har gått ned siden sist, noe som er veldig positivt. Fortsett med den samme dietten og mosjon. Vi sees til neste kontroll i desember."),
        (user_id_tilda,  user_id_ghulam,  "Timebestilling",                 "Hei Dr. Ghulam, jeg lurer på om det er mulig å få time tidligere enn planlagt. Jeg har hatt litt vondt i brystet de siste dagene og ønsker å få det sjekket."),
        (user_id_hansen, user_id_aurora,  "Velkommen som pasient",          "Hei Aurora, velkommen til Eaze legesenter! Jeg er Dr. Hansen og vil være din fastlege. Ikke nøl med å ta kontakt hvis du har spørsmål eller trenger hjelp."),
        (user_id_ghulam, user_id_aurora,  "Hudundersøkelse resultater",     "Hei Aurora, undersøkelsen viste ingen tegn til alvorlige forandringer. Vi anbefaler likevel at du bruker solkrem daglig og holder øye med eventuelle nye flekker."),
        (user_id_aurora, user_id_hansen,  "Spørsmål om henvisning",         "Hei Dr. Hansen, jeg har fått beskjed fra Dr. Ghulam om at jeg muligens trenger en henvisning. Kan du hjelpe meg med dette?"),
    ]
    for avsender, mottaker, overskrift, innhold in meldinger:
        cursor.execute("""
            INSERT INTO melding (avsenderID, mottakerID, overskrift, innhold)
            VALUES (?, ?, ?, ?)
        """, (avsender, mottaker, overskrift, innhold))
    print("✓ Opprettet testmeldinger mellom leger og pasienter")

    # Testresepter for Tilda Løvold
    resepter_tilda = [
        ("Paracet 500 mg tabletter", "1-2 tabletter ved behov, maks 3 ganger daglig", "20 stk", 2, "2026-09-10", "Følg pakningsvedlegg. Ikke kombiner med annen paracetamol.", "aktiv"),
        ("Nasonex nesespray 50 µg/dose", "1 spray i hvert nesebor morgen og kveld", "1 flaske", 1, "2026-10-23", "Ved tett nese og allergi", "aktiv"),
        ("Sobril 10 mg tabletter", "1 tablett ved behov (maks 3 pr dag)", "25 stk", 0, "2026-11-23", "Korttidsbruk ved angst. Ikke kjør bil etter inntak.", "aktiv"),
        ("Ibux 400 mg tabletter", "1 tablett 3 ganger daglig", "30 stk", 1, "2024-05-01", "Ta med mat", "arkivert"),
    ]
    for mediNavn, dosering, mengde, reiterasjoner, utlopsdato, kommentar, status in resepter_tilda:
        cursor.execute("""
            INSERT INTO resept (fnr, ansattID, mediNavn, dosering, mengde, reiterasjoner, utlopsdato, kommentar, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("22079812346", ansatt_id_hansen, mediNavn, dosering, mengde, reiterasjoner, utlopsdato, kommentar, status))
    print("✓ Opprettet testresepter for Tilda Løvold")

    # Testresepter for Mumtaz Cade
    resepter_mumtaz = [
        ("Metformin 500 mg tabletter", "1 tablett 2 ganger daglig", "60 stk", 3, "2026-12-01", "Ta med mat. Kontroller blodsukkeret regelmessig.", "aktiv"),
        ("Lisinopril 10 mg tabletter", "1 tablett daglig", "30 stk", 2, "2026-08-15", "Blodtrykksmedisinen. Ikke slutt brått.", "aktiv"),
        ("Voltaren 50 mg tabletter", "1 tablett 3 ganger daglig", "20 stk", 0, "2024-03-10", "Kortvarig bruk mot smerter", "arkivert"),
    ]
    for mediNavn, dosering, mengde, reiterasjoner, utlopsdato, kommentar, status in resepter_mumtaz:
        cursor.execute("""
            INSERT INTO resept (fnr, ansattID, mediNavn, dosering, mengde, reiterasjoner, utlopsdato, kommentar, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("14038512345", ansatt_id_ghulam, mediNavn, dosering, mengde, reiterasjoner, utlopsdato, kommentar, status))
    print("✓ Opprettet testresepter for Mumtaz Cade")

    # Testresepter for Aurora Krogstad
    resepter_aurora = [
        ("Cetirizin 10 mg tabletter", "1 tablett daglig ved behov", "30 stk", 1, "2026-07-20", "Mot allergisymptomer", "aktiv"),
        ("Prednisolon 5 mg tabletter", "Som foreskrevet", "20 stk", 0, "2024-11-30", "Kortvarig kur", "arkivert"),
    ]
    for mediNavn, dosering, mengde, reiterasjoner, utlopsdato, kommentar, status in resepter_aurora:
        cursor.execute("""
            INSERT INTO resept (fnr, ansattID, mediNavn, dosering, mengde, reiterasjoner, utlopsdato, kommentar, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("05119212347", ansatt_id_hansen, mediNavn, dosering, mengde, reiterasjoner, utlopsdato, kommentar, status))
    print("✓ Opprettet testresepter for Aurora Krogstad")

    # Pasientinfo for alle pasienter
    pasientinfo = [
        ("14038512345", "om_pasient",   "Født 1985"),
        ("14038512345", "om_pasient",   "Røyker ikke"),
        ("14038512345", "om_pasient",   "Trener 2-3 ganger i uken"),
        ("14038512345", "om_pasient",   "Gift, to barn"),
        ("14038512345", "kritisk_info", "Diabetiker type 2"),
        ("14038512345", "kritisk_info", "Allergisk mot penicillin"),

        ("22079812346", "om_pasient",   "Født 1998"),
        ("22079812346", "om_pasient",   "Student"),
        ("22079812346", "om_pasient",   "Ikke-røyker"),
        ("22079812346", "om_pasient",   "Kjent med sesongallergi"),
        ("22079812346", "kritisk_info", "Allergisk mot latex"),
        ("22079812346", "kritisk_info", "Høyt kolesterol"),

        ("05119212347", "om_pasient",   "Født 1992"),
        ("05119212347", "om_pasient",   "Jobber som lærer"),
        ("05119212347", "om_pasient",   "Aktiv mosjonist"),
        ("05119212347", "kritisk_info", "Eksem, unngå kortisonkrem"),
        ("05119212347", "kritisk_info", "Allergisk mot sulfa"),
    ]
    for fnr, kategori, innhold in pasientinfo:
        cursor.execute("""
            INSERT INTO pasient_info (fnr, kategori, innhold)
            VALUES (?, ?, ?)
        """, (fnr, kategori, innhold))
    print("✓ Opprettet pasientinfo for alle pasienter")

    connection.commit()
    connection.close()

    print("\n Seeding fullført!")
    print("\nTestbrukere:")
    print("  Leger:")
    print("    dr_hansen       / hemmelig123")
    print("    dr_ghulam       / hemmelig123")
    print("  Pasienter:")
    print("    14038512345     / pasientMumtaz   (Mumtaz Cade, født 14.03.1985)")
    print("    22079812346     / pasientTilda    (Tilda Løvold, født 22.07.1998)")
    print("    05119212347     / pasientAurora   (Aurora Krogstad, født 05.11.1992)")

if __name__ == "__main__":
    seed()