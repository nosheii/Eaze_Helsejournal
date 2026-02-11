import { useState } from 'react'
import Login from './Login'
import { jwtDecode } from "jwt-decode";

function App() { // Sjekk om det allerede finnes en token i sessionStorage (dvs. at brukeren er logget inn)
    const existing_token = sessionStorage.getItem("token") || null // Sjekk om det finnes en token i sessionStorage

    let decoded_token = null; // Hvis det finnes en token i sessionStorage, decode den for å hente ut rolle og brukerinfo
    if (existing_token) decoded_token = jwtDecode(existing_token) // decode token for å hente ut rolle og brukerinfo

    const [token, setToken] = useState(existing_token) // useState for å huske token (hvis det finnes)
    const [rolle, setRolle] = useState(decoded_token ? decoded_token.rolle : null) // useState for å huske rolle (hvis det finnes)
    const [brukerinfo, setBrukerinfo] = useState(decoded_token ? decoded_token.brukerinfo : null) // useState for å huske brukerinfo (hvis det finnes)

    function handleLoginSuccess(nyToken, nyRolle, nyBrukerinfo) { // Denne funksjonen kalles når Login.jsx får en vellykket login-respons fra backend
        sessionStorage.setItem("token", nyToken) // Lagre token i sessionStorage slik at den er tilgjengelig ved refresh
        setToken(nyToken) // Oppdaterer token i state for å indikere at brukeren er logget inn
        setRolle(nyRolle) // Oppdaterer rolle i state slik at vi kan vise riktig dashboard
        setBrukerinfo(nyBrukerinfo) // Oppdaterer brukerinfo i state slik at vi kan vise det i dashboardet
    }

    function handleLoggUt() { // Denne funksjonen kalles når brukeren klikker på "Logg ut"-knappen
        setToken(null) // Fjerner token fra state for å indikere at brukeren er logget ut
        setRolle(null) // Fjerner rolle fra state
        setBrukerinfo(null) // Fjerner brukerinfo fra state

        sessionStorage.removeItem("token") // Fjerner token fra sessionStorage slik at den ikke lenger er tilgjengelig ved refresh
    }

    // Hvis ikke innlogget - vis Login-siden
    if (!token) { // Hvis det ikke finnes en token (!utrops tegnet betyr "ikke"), vis Login-siden (dvs. at brukeren ikke er logget inn)
        return <Login onLoginSuccess={handleLoginSuccess} /> 
    }

    // Hvis innlogget - vis dashboard basert på rolle
    return (
        <div>
            <h1>Velkommen, {brukerinfo.navn}!</h1>
            <p>Du er logget inn som: <strong>{rolle}</strong></p>

            {/* Vis ulik info basert på rolle */}
            {rolle === "lege" && (
                <div>
                    <h2>Lege-dashboard</h2>
                    <p>AnsattID: {brukerinfo.ansattID}</p>
                    <p>Mail: {brukerinfo.mail}</p>
                    <p>Her kan legen se journaler, pasienter og mer...</p>
                </div>
            )}

            {rolle === "pasient" && (
                <div>
                    <h2>Pasient-dashboard</h2>
                    <p>Her kan pasienten se sin egen informasjon...</p>
                </div>
            )}

            <button onClick={handleLoggUt}>Logg ut</button>
        </div>
    )
}

export default App
