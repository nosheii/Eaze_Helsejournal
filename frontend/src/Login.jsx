import { useState } from 'react'

function Login({ onLoginSuccess }) {
    // useState for å huske hva brukeren skriver
    const [brukernavn, setBrukernavn] = useState("")
    const [passord, setPassord] = useState("")
    const [feilmelding, setFeilmelding] = useState("")
    const [laster, setLaster] = useState(false)

    async function handleLogin() {
        setLaster(true)
        setFeilmelding("")

        try {
            // Send brukernavn og passord til backend
            const respons = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    brukernavn: brukernavn,
                    passord: passord
                })
            })

            const data = await respons.json()
            
            if (respons.ok) {
                // Login vellykket! Send token og brukerinfo tilbake til App.jsx
                onLoginSuccess(data.access_token, data.rolle, data.brukerinfo)
            } else {
                // Feil brukernavn eller passord
                setFeilmelding(data.detail || "Feil brukernavn eller passord")
            }

        } catch (error) {
            setFeilmelding("Kunne ikke koble til server. Prøv igjen.")
        } finally {
            setLaster(false)
        }
    }

    return (
        <div>
            <h2>Logg inn</h2>

            <div>
                <label>Brukernavn</label>
                <input
                    type="text"
                    value={brukernavn}
                    onChange={(e) => setBrukernavn(e.target.value)}
                    placeholder="Skriv inn brukernavn"
                />
            </div>

            <div>
                <label>Passord</label>
                <input
                    type="password"
                    value={passord}
                    onChange={(e) => setPassord(e.target.value)}
                    placeholder="Skriv inn passord"
                />
            </div>

            {feilmelding && <p style={{ color: "red" }}>{feilmelding}</p>}

            <button onClick={handleLogin} disabled={laster}>
                {laster ? "Logger inn..." : "Logg inn"}
            </button>
        </div>
    )
}

export default Login 