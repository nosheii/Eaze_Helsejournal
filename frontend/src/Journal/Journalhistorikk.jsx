import { useState, useEffect } from 'react'
import styles from "./Journalhistorikk.module.css"

function JournalHistorikk({ fnr }) {
    const [avtaler, setAvtaler] = useState([]) // lagrer alle avtaler
    const [feilmelding, setFeilmelding] = useState("")
    const [laster, setLaster] = useState(true)

    // useEffect kjører automatisk når komponenten lastes inn
    // Det er her vi henter data fra backend
    useEffect(() => {
        hentAvtaler()
    }, [fnr])

    async function hentAvtaler() {
        setLaster(true)
        setFeilmelding("")

        try {
            const token = sessionStorage.getItem("token")

            const respons = await fetch(`http://127.0.0.1:8000/avtaler/${fnr}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            const data = await respons.json()

            if (respons.ok) {
                setAvtaler(data.avtaler)
            } else {
                setFeilmelding(data.detail || "Kunne ikke hente avtaler")
            }

        } catch (error) {
            setFeilmelding("Kunne ikke koble til server. Prøv igjen.")
        } finally {
            setLaster(false)
        }
    }

    // Deler avtalene inn i kommende og tidligere basert på tidspunkt
    const nå = new Date()
    const kommende = avtaler.filter(a => new Date(a.tidspunkt) > nå)
    const tidligere = avtaler.filter(a => new Date(a.tidspunkt) <= nå)

    if (laster) return <p>Laster avtaler...</p>
    if (feilmelding) return <p style={{ color: "red" }}>{feilmelding}</p>

return (
    <div className={styles.container}>
        <h2 className={styles.tittel}>Besøkshistorikk</h2>

        <div className={styles.seksjon}>
            <h3 className={styles.seksjonTittel}>Kommende avtaler</h3>
            {kommende.length === 0 ? (
                <p className={styles.ingenAvtaler}>Ingen kommende avtaler</p>
            ) : (
                kommende.map(avtale => (
                    <div key={avtale.avtaleID} className={styles.avtaleKort}>
                        <span className={styles.avtaleTidspunkt}>{avtale.tidspunkt}</span>
                        <span className={styles.avtaleLege}>{avtale.legeNavn}</span>
                        <span className={styles.avtaleKommentar}>{avtale.kommentar || "Ingen kommentar"}</span>
                    </div>
                ))
            )}
        </div>

        <div className={styles.seksjon}>
            <h3 className={styles.seksjonTittel}>Tidligere avtaler</h3>
            {tidligere.length === 0 ? (
                <p className={styles.ingenAvtaler}>Ingen tidligere avtaler</p>
            ) : (
                tidligere.map(avtale => (
                    <div key={avtale.avtaleID} className={styles.avtaleKort}>
                        <span className={styles.avtaleTidspunkt}>{avtale.tidspunkt}</span>
                        <span className={styles.avtaleLege}>{avtale.legeNavn}</span>
                        <span className={styles.avtaleKommentar}>{avtale.kommentar || "Ingen kommentar"}</span>
                    </div>
                ))
            )}
        </div>
    </div>
)
}

export default JournalHistorikk 