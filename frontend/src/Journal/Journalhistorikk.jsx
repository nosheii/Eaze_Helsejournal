import { useState, useEffect } from 'react'
import styles from "./Journalhistorikk.module.css"

function JournalHistorikk({ fnr }) {
    const [avtaler, setAvtaler] = useState([])
    const [feilmelding, setFeilmelding] = useState("")
    const [laster, setLaster] = useState(true)

    // Skjema-states
    const [visSkjema, setVisSkjema] = useState(false)
    const [nyttTidspunkt, setNyttTidspunkt] = useState("")
    const [nyKommentar, setNyKommentar] = useState("")
    const [lagreError, setLagreError] = useState("")

    // Redigerings-states
    const [redigertAvtaleID, setRedigertAvtaleID] = useState(null)
    const [redigertTidspunkt, setRedigertTidspunkt] = useState("")
    const [redigertKommentar, setRedigertKommentar] = useState("")

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
                headers: { "Authorization": `Bearer ${token}` }
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

    async function opprettAvtale(e) {
        e.preventDefault()
        setLagreError("")
        try {
            const token = sessionStorage.getItem("token")
            const respons = await fetch("http://127.0.0.1:8000/avtaler", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fnr: fnr,
                    tidspunkt: nyttTidspunkt,
                    kommentar: nyKommentar
                })
            })
            const data = await respons.json()
            if (respons.ok) {
                // Lukk skjema, nullstill felter og hent oppdatert liste
                setVisSkjema(false)
                setNyttTidspunkt("")
                setNyKommentar("")
                hentAvtaler()
            } else {
                setLagreError(data.detail || "Kunne ikke opprette avtale")
            }
        } catch (error) {
            setLagreError("Kunne ikke koble til server. Prøv igjen.")
        }
    }

    async function slettAvtale(avtaleID) {
        try {
            const token = sessionStorage.getItem("token")
            const respons = await fetch(`http://127.0.0.1:8000/avtaler/${avtaleID}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (respons.ok) {
                hentAvtaler()
            } else {
                const data = await respons.json()
                setFeilmelding(data.detail || "Kunne ikke slette avtale")
            }
        } catch (error) {
            setFeilmelding("Kunne ikke koble til server. Prøv igjen.")
        }
    }

    async function endreAvtale(e) {
        e.preventDefault()
        setLagreError("")
        try {
            const token = sessionStorage.getItem("token")
            const respons = await fetch(`http://127.0.0.1:8000/avtaler/${redigertAvtaleID}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tidspunkt: redigertTidspunkt,
                    kommentar: redigertKommentar
                })
            })
            const data = await respons.json()
            if (respons.ok) {
                setRedigertAvtaleID(null)
                setRedigertTidspunkt("")
                setRedigertKommentar("")
                hentAvtaler()
            } else {
                setLagreError(data.detail || "Kunne ikke endre avtale")
            }
        } catch (error) {
            setLagreError("Kunne ikke koble til server. Prøv igjen.")
        }
    }

    const nå = new Date()
    const kommende = avtaler.filter(a => new Date(a.tidspunkt) > nå)
    const tidligere = avtaler.filter(a => new Date(a.tidspunkt) <= nå)

    if (laster) return <p>Laster avtaler...</p>
    if (feilmelding) return <p style={{ color: "red" }}>{feilmelding}</p>

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.tittel}>Besøkshistorikk</h2>
                <button
                    className={styles.nyAvtaleKnapp}
                    onClick={() => setVisSkjema(!visSkjema)}
                >
                    {visSkjema ? "Avbryt" : "+ Ny avtale"}
                </button>
            </div>

            {visSkjema && (
                <form className={styles.skjema} onSubmit={opprettAvtale}>
                    <div className={styles.skjemaFelt}>
                        <label>Tidspunkt</label>
                        <input
                            type="datetime-local"
                            value={nyttTidspunkt}
                            onChange={(e) => setNyttTidspunkt(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.skjemaFelt}>
                        <label>Kommentar</label>
                        <input
                            type="text"
                            value={nyKommentar}
                            onChange={(e) => setNyKommentar(e.target.value)}
                            placeholder="Valgfri kommentar"
                        />
                    </div>
                    {lagreError && <p style={{ color: "red" }}>{lagreError}</p>}
                    <button className={styles.lagreKnapp} type="submit">Lagre avtale</button>
                </form>
            )}

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
                            <div className={styles.avtaleKnapper}>
                                <button 
                                    className={styles.endreKnapp} 
                                    onClick={() => {
                                        setRedigertAvtaleID(avtale.avtaleID)
                                        setRedigertTidspunkt(avtale.tidspunkt)
                                        setRedigertKommentar(avtale.kommentar || "")
                                    }}
                                >Endre</button>
                                <button className={styles.slettKnapp} onClick={() => slettAvtale(avtale.avtaleID)}>Slett</button>
                            </div>
                                {/* Hvis denne avtalen er den som redigeres, vis redigeringsskjemaet */}
                                    {redigertAvtaleID === avtale.avtaleID && (
                                        <form className={styles.skjema} onSubmit={endreAvtale}>
                                            <div className={styles.skjemaFelt}>
                                                <label>Endre Tidspunkt</label>
                                                <input
                                                    type="datetime-local"
                                                    value={redigertTidspunkt}
                                                    onChange={(e) => setRedigertTidspunkt(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className={styles.skjemaFelt}>
                                                <label>Endre Kommentar</label>
                                                <input
                                                    type="text"
                                                    value={redigertKommentar}
                                                    onChange={(e) => setRedigertKommentar(e.target.value)}
                                                    placeholder="Valgfri kommentar"
                                                />
                                            </div>
                                            {lagreError && <p style={{ color: "red" }}>{lagreError}</p>}
                                            <div className={styles.avtaleKnapper}>
                                                <button className={styles.lagreKnapp} type="submit">Lagre endring</button>
                                                <button 
                                                    className={styles.endreKnapp} 
                                                    type="button"
                                                    onClick={() => setRedigertAvtaleID(null)}
                                                >Avbryt</button>
                                            </div>
                                        </form>
                                    )}
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