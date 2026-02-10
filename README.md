Dette repoet er delt inn i 2 deler: **frontend** og **backend**

Følgende struktur viser de viktige filene og rollene de har i prosjektet
```
backend/
  - main.py # Selve serveren
  - database.py # Hjelpefunksjoner for database
  - app.db # SQLite databasen (denne genereres ved første oppstart av serveren)
frontend/
  src/
    - main.jsx # Dette er filen som "setter opp React"
    - App.jsx # Dette er hovedkomponenten som "main.jsx" trekker inn
    - index.css # Styling for App
    - app.css # Styling for "nettsiden"
  - package.json # "Manifestet" til applikasjonen. Definerer hvilke pakker og hvilke versjoner av pakker dere bruker samt hvilke script som er tilgjengelige å kjøre (f.eks npm run dev)
  - index.html # Dette er filen nettleseren laster inn
```

## Backend
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLite] (https://sqlite.org/)

### Kom i gang 
1. Lag et [virtual environment (venv)](https://www.w3schools.com/python/python_virtualenv.asp) i `/backend` mappen
   - `python3 -m venv .navnpådittvenv`
   - ```bash
     #MacOS/Linux
     source .navnpådittvenv/bin/activate

     #Windows (CMD)
     .navnpådittvenv\Scripts\activate.bat

     #Windows (Powershell)
     .navnpådittvenv\Scripts\Activate.ps1
     ``
2. Start backend serveren fra backend mappen med `fastapi dev main.py
3. Besøk [https://127.0.0.1:8000/docs](https://127.0.0.1:8000/docs) for å se API'et

## Frontend
- [React](https://react.dev/)
### Kom i gang
1. Sørg for at du har [Node.js](https://nodejs.org./en) installert
2. Kjør `npm install` inne i `frontend` mappen
3. Kjør `npm run dev` inne i `frontend` mappen
4. Besøk [http://localhost:5173/](http://localhost:5173/) i nettleseren
