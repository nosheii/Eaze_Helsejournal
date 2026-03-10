import { useState } from 'react'
import styles from './Login.module.css'

function Login({ onLoginSuccess }) {
    const [brukernavn, setBrukernavn] = useState("")
    const [passord, setPassord] = useState("")
    const [feilmelding, setFeilmelding] = useState("")
    const [laster, setLaster] = useState(false)

    async function handleLogin() {
        setLaster(true)
        setFeilmelding("")
        try {
            const respons = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brukernavn, passord })
            })
            const data = await respons.json()
            if (respons.ok) {
                onLoginSuccess(data.access_token, data.rolle, data.brukerinfo)
            } else {
                setFeilmelding(data.detail || "Feil brukernavn eller passord")
            }
        } catch {
            setFeilmelding("Kunne ikke koble til server. Prøv igjen.")
        } finally {
            setLaster(false)
        }
    }

    function handleSubmit(e) {
        e.preventDefault()
        handleLogin()
    }

    return (
        <div className={styles.loginPage}>
            <p className={styles.usnBanner}>Eaze er et studentprosjekt ved USN</p>

            <div className={styles.loginCard}>
                <h2 className={styles.loginTitle}>Logg inn</h2>
                <p className={styles.loginSubtitle}>Bruk dine tildelte innloggingsdetaljer</p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label>Brukernavn</label>
                        <input
                            type="text"
                            value={brukernavn}
                            onChange={(e) => setBrukernavn(e.target.value)}
                            placeholder="Skriv inn brukernavn"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Passord</label>
                        <input
                            type="password"
                            value={passord}
                            onChange={(e) => setPassord(e.target.value)}
                            placeholder="Skriv inn passord"
                        />
                    </div>

                    {feilmelding && <p className={styles.feilmelding}>{feilmelding}</p>}

                    <button className={styles.loginBtn} type="submit" disabled={laster}>
                        {laster ? "Logger inn..." : "Logg inn"}
                    </button>
                </form>
            </div>

        </div>
    )
}

export default Login