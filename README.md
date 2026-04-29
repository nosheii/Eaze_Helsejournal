
# Eaze — Helsejournal

Studentprosjekt ved USN, gruppe 11.

**Gruppemedlemmer:**
Nora, Tilda, Sofie, Aurora, Ana Maria og Mumtaz

---

## Om prosjektet

Eaze er en moderne helsejournal-applikasjon utviklet som en del av et studentprosjekt ved USN.
Målet med Eaze har vært å lage et system som gjør kommunikasjonen mellom lege og pasient
enklere, mer oversiktlig og tilgjengelig for alle.

Navnet *Eaze* reflekterer kjerneverdien i prosjektet — enkelhet. Vi ønsket å lage en løsning
som føles naturlig å bruke, uten unødvendig kompleksitet. Pasienter skal enkelt kunne holde
seg oppdatert på egen helse, mens leger får et ryddig verktøy for å administrere journaler,
resepter og avtaler.

Applikasjonen er bygget med et tydelig rollebasert system — leger og pasienter får ulike
visninger og tilganger tilpasset deres behov. All kommunikasjon mellom frontend og backend
er sikret med JWT-autentisering, og sensitive data er beskyttet mot uautorisert tilgang.

Selv om Eaze er et skoleprosjekt — er det et gjennomtenkt konsept vi har tatt på alvor
fra første strek til siste linje med kode.

---

## Prosjektstruktur

backend/

main.py        # API-endepunkter og serverlogikk
database.py    # Databaseoppsett og tilkoblinger
seed.py        # Testdata
app.db         # SQLite-databasen (genereres automatisk)

frontend/
src/
- main.jsx     # Setter opp React
- App.jsx      # Hovedkomponent
- index.css    # Global styling

package.json   # Pakkeoversikt og scripts
index.html     # Inngangspunkt for nettleseren

---

## Teknologi

| Del      | Teknologi                 |
|----------|---------------------------|
| Frontend | React, Vite, CSS Modules  |
| Backend  | FastAPI, Python           |
| Database | SQLite                    |
| Auth     | JWT (JSON Web Token)      |
| Ikoner   | Lucide-React              |

---

## Hvordan man åpner prosjektet

### Krav
- Python installert
- Node.js installert

### Backend
```powershell
cd backend

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# MacOS/Linux
source .venv/bin/activate

py database.py        # Oppretter tabeller
py seed.py            # Fyller inn testdata
uvicorn main:app --reload    # Starter server
```

Backend kjører på: `http://127.0.0.1:8000`
API-dokumentasjon: `http://127.0.0.1:8000/docs` (Swagger)

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

Frontend kjører på: `http://localhost:5173`

---

## Testbrukere

| Rolle   | Brukernavn   | Passord       | Navn            |
|---------|--------------|---------------|-----------------|
| Lege    | dr_hansen    | hemmelig123   | Dr. Hansen      |
| Lege    | dr_ghulam    | hemmelig123   | Dr. Ghulam      |
| Pasient | 14038512345  | pasientMumtaz | Mumtaz Cade     |
| Pasient | 22079812346  | pasientTilda  | Tilda Løvold    |
| Pasient | 05119212347  | pasientAurora | Aurora Krogstad |

---

## Funksjoner

### Lege
- Logge inn og se oversikt på hjemside
- Søke opp pasient via fødselsnummer
- Se og administrere pasientjournal med følgende faner:
  - **Om pasient** — personlig informasjon
  - **Medikament** — se, legge til, endre og slette resepter. Arkivere utløpte resepter
  - **Vaksiner** — se og registrere vaksiner
  - **Journaldokumenter** — lese og skrive journalnotater
  - **Besøkshistorikk** — se, legge til, endre og slette avtaler
- Innboks — lese og sende meldinger
- Avtaler — se egne kommende avtaler

### Pasient
- Logge inn og se oversikt på hjemside
- Gå direkte inn på sin egen journal
- Se journal med følgende faner:
  - **Om pasient** — personlig informasjon
  - **Medikament** — se aktive og arkiverte resepter, be om fornyelse
  - **Vaksiner** — se vaksineoversikt
  - **Journaldokumenter** — lese journalnotater
  - **Besøkshistorikk** — se kommende og tidligere avtaler
- Innboks — lese og sende meldinger til lege
- Avtaler — se egne kommende avtaler

---

## API-endepunkter

| Metode | Endepunkt | Beskrivelse |
|--------|-----------|-------------|
| POST | /login | Logg inn |
| GET | /journal/{fnr} | Hent journal for pasient |
| POST | /journal | Opprett journal |
| GET | /dokument/{journalNr} | Hent journaldokumenter |
| POST | /dokument | Opprett dokument |
| GET | /vaksine/{fnr} | Hent vaksiner |
| POST | /vaksine | Registrer vaksine |
| GET | /avtaler/{fnr} | Hent avtaler for pasient |
| POST | /avtaler | Opprett avtale |
| PUT | /avtaler/{avtaleID} | Endre avtale |
| DELETE | /avtaler/{avtaleID} | Slett avtale |
| GET | /avtaler/mine | Hent egne avtaler |
| GET | /resept/{fnr} | Hent resepter |
| POST | /resept | Opprett resept |
| PUT | /resept/{reseptID} | Endre resept |
| DELETE | /resept/{reseptID} | Slett resept |
| GET | /meldinger | Hent meldinger |
| POST | /meldinger | Send melding |
| PATCH | /meldinger/{meldingID}/lest | Merk melding som lest |
| GET | /pasient/{fnr}/info | Hent pasientinfo |
| PUT | /pasient/{fnr}/info | Oppdater pasientinfo |

---

## Detaljert API-dokumentasjon

> Alle endepunkter (unntatt `/login`) krever JWT-token i headeren:
> `Authorization: Bearer <token>`

---

### ARBEIDSKRAV  ### 

Dokumentasjon for hvert endepunkt: 

HTTP-metode og URL 

Eksempler på forespørsler og svar 

Påkrevde parametere og valideringsregler 

Mulige feilkoder og statuskoder 

 

 

 
### POST /login 

Logger inn en bruker og returnerer en JWT-token. 

 

**Forespørsel:** 

```json 

{ 

  "brukernavn": "dr_hansen", 

  "passord": "hemmelig123" 

} 

``` 

 

**Svar (200 OK):** 

```json 

{ 

  "access_token": "eyJ...", 

  "token_type": "bearer", 

  "rolle": "lege", 

  "brukerinfo": { 

    "ansattID": 1, 

    "navn": "Dr. Hansen", 

    "mail": "hansen@eaze.no" 

  } 

} 

``` 

 

**Feilkoder:** 

| Kode | Beskrivelse | 

|------|-------------| 

| 401 | Feil brukernavn eller passord | 

 
 

-------- 

 
 
### GET /journal/{fnr} 

Henter journal for en spesifikk pasient. 

 

**Parametere:** 

| Parameter | Type | Beskrivelse | 

|-----------|------|-------------| 

| fnr | string | Pasientens fødselsnummer | 

 

**Svar (200 OK):** 

```json 

{ 

  "journaler": [ 

    { 

      "journalNr": 1, 

      "fnr": "14038512345", 

      "opprettetDato": "2023-01-10", 

      "legeNavn": "Dr. Hansen", 

      "forNavn": "Mumtaz", 

      "etterNavn": "Cade" 

    } 

  ] 

} 

``` 

 

**Feilkoder:** 

| Kode | Beskrivelse | 

|------|-------------| 

| 401 | Ugyldig eller utløpt token | 

| 403 | Pasient forsøker å se annen pasients journal | 

 

--- 

 
### PUT /avtaler/{avtaleID} 

Endrer en eksisterende avtale. Krever lege-rolle. 

 
 

**Parametere:** 

| Parameter | Type | Beskrivelse | 

|-----------|------|-------------| 

| avtaleID | int | Avtalens ID | 

 

**Forespørsel:** 

```json 

{ 

  "tidspunkt": "2026-10-01 10:00", 

  "kommentar": "Oppfølging" 

} 

``` 
 

**Svar (200 OK):** 

```json 

{ 

  "status": "Avtale oppdatert!" 

} 

``` 

 

**Feilkoder:** 

| Kode | Beskrivelse | 

|------|-------------| 

| 401 | Ugyldig eller utløpt token | 

| 403 | Kun leger kan endre avtale | 

 

--- 

 

### DELETE /avtaler/{avtaleID} 

Sletter en avtale. Krever lege-rolle. 

 
 

**Parametere:** 

| Parameter | Type | Beskrivelse | 

|-----------|------|-------------| 

| avtaleID | int | Avtalens ID | 

 
 

**Svar (200 OK):** 

```json 

{ 

  "status": "Avtale slettet!" 

} 

``` 

 

**Feilkoder:** 

| Kode | Beskrivelse | 

|------|-------------| 

| 401 | Ugyldig eller utløpt token | 

| 403 | Kun leger kan slette avtale | 

 

--- 

 

### PATCH /meldinger/{meldingID}/lest 

Markerer en melding som lest. 

 

**Parametere:** 

| Parameter | Type | Beskrivelse | 

|-----------|------|-------------| 

| meldingID | int | Meldingens ID | 

 
 

**Svar (200 OK):** 

```json 

{ 

  "status": "Merket som lest" 

} 

``` 

 

**Feilkoder:** 

| Kode | Beskrivelse | 

|------|-------------| 

| 401 | Ugyldig eller utløpt token | 

| 403 | Kan bare merke egne meldinger som lest | 

 

--- 

### PUT /pasient/{fnr}/info 

Oppdaterer personlig informasjon om en pasient. Krever lege-rolle. 

 
 

**Parametere:** 

| Parameter | Type | Beskrivelse | 

|-----------|------|-------------| 

| fnr | string | Pasientens fødselsnummer | 

 
 

**Forespørsel:** 

```json 

{ 

  "kategori": "Allergier", 

  "innhold": "Penicillin, Nøtter" 

} 

``` 

 

**Svar (200 OK):** 

```json 

{ 

  "status": "Info oppdatert!" 

} 

``` 

 

**Feilkoder:** 

| Kode | Beskrivelse | 

|------|-------------| 

| 401 | Ugyldig eller utløpt token | 

| 403 | Kun leger kan oppdatere pasientinfo | 

 
 