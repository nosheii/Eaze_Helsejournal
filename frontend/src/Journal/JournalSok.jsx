import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './JournalSok.module.css'

function JournalSok() {
    const [fnr, setFnr] = useState("")
    const [feilmelding, setFeilmelding] = useState("")
    const [laster, setLaster] = useState(false)
    const navigate = useNavigate()

    async function handleSok() {
        setLaster(true)
        setFeilmelding("")
        try {
            const token = sessionStorage.getItem("token")
            const respons = await fetch(`http://127.0.0.1:8000/journal/${fnr}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await respons.json()
            if (respons.ok) {
                navigate(`/journal/${fnr}`)
            } else {
                setFeilmelding(data.detail || "Fant ingen pasient med dette fødselsnummeret")
            }
        } catch (error) {
            setFeilmelding("Kunne ikke koble til server. Prøv igjen.")
        } finally {
            setLaster(false)
        }
    }

    function handleSubmit(e) {
        e.preventDefault()
        handleSok()
    }

    return (
        <div className={styles.side}>
            <h2 className={styles.tittel}>Søk på pasient</h2>
            <div className={styles.kort}>

                <form onSubmit={handleSubmit}>
                    <div className={styles.felt}>
                        <label>Fødselsnummer</label>
                        <input
                            type="text"
                            value={fnr}
                            onChange={(e) => setFnr(e.target.value)}
                            placeholder="11 siffer"
                        />
                    </div>

                    {feilmelding && <p className={styles.feilmelding}>{feilmelding}</p>}

                    <button className={styles.knapp} type="submit" disabled={laster}>
                        {laster ? "Søker..." : "Søk"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default JournalSok