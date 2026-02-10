import { useState } from 'react'
import Login from './Login'

function App() {
    // Lagrer token, rolle og brukerinfo når bruker logger inn
    const [token, setToken] = useState(null)
    const [rolle, setRolle] = useState(null)
    const [brukerinfo, setBrukerinfo] = useState(null)

    function handleLoginSuccess(nyToken, nyRolle, nyBrukerinfo) {
        setToken(nyToken)
        setRolle(nyRolle)
        setBrukerinfo(nyBrukerinfo)
    }

    function handleLoggUt() {
        setToken(null)
        setRolle(null)
        setBrukerinfo(null)
    }

    // Hvis ikke innlogget - vis Login-siden
    if (!token) {
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
