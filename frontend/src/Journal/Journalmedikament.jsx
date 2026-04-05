// Tilda Løvold - 273803

import { useState, useEffect } from 'react'
import styles from "./Journalmedikament.module.css"

function JournalMedikament({ fnr, rolle }) {
    const [resepter, setResepter] = useState([])
    const [feilmelding, setFeilmelding] = useState("")
    const [laster, setLaster] = useState(true)
    const [aktivFane, setAktivFane] = useState("aktiv")

    // Skjema-states for ny resept
    const [visSkjema, setVisSkjema] = useState(false)
    const [nyttMediNavn, setNyttMediNavn] = useState("")
    const [nyDosering, setNyDosering] = useState("")
    const [nyMengde, setNyMengde] = useState("")
    const [nyReiterasjoner, setNyReiterasjoner] = useState(0)
    const [nyUtlopsdato, setNyUtlopsdato] = useState("")
    const [nyKommentar, setNyKommentar] = useState("")
    const [lagreError, setLagreError] = useState("")

    // Redigerings-states
    const [redigertReseptID, setRedigertReseptID] = useState(null)
    const [redigertMediNavn, setRedigertMediNavn] = useState("")
    const [redigertDosering, setRedigertDosering] = useState("")
    const [redigertMengde, setRedigertMengde] = useState("")
    const [redigertReiterasjoner, setRedigertReiterasjoner] = useState(0)
    const [redigertUtlopsdato, setRedigertUtlopsdato] = useState("")
    const [redigertKommentar, setRedigertKommentar] = useState("")
    const [redigertStatus, setRedigertStatus] = useState("aktiv")

    useEffect(() => {
        hentResepter()
    }, [fnr])

    async function hentResepter() {
        setLaster(true)
        setFeilmelding("")
        try {
            const token = sessionStorage.getItem("token")
            const respons = await fetch(`http://127.0.0.1:8000/resept/${fnr}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await respons.json()
            if (respons.ok) {
                setResepter(data.resepter)
            } else {
                setFeilmelding(data.detail || "Kunne ikke hente resepter")
            }
        } catch (error) {
            setFeilmelding("Kunne ikke koble til server. Prøv igjen.")
        } finally {
            setLaster(false)
        }
    }

    async function opprettResept(e) {
        e.preventDefault()
        setLagreError("")
        try {
            const token = sessionStorage.getItem("token")
            const respons = await fetch("http://127.0.0.1:8000/resept", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fnr: fnr,
                    mediNavn: nyttMediNavn,
                    dosering: nyDosering,
                    mengde: nyMengde,
                    reiterasjoner: nyReiterasjoner,
                    utlopsdato: nyUtlopsdato,
                    kommentar: nyKommentar
                })
            })
            const data = await respons.json()
            if (respons.ok) {
                setVisSkjema(false)
                setNyttMediNavn("")
                setNyDosering("")
                setNyMengde("")
                setNyReiterasjoner(0)
                setNyUtlopsdato("")
                setNyKommentar("")
                hentResepter()
            } else {
                setLagreError(data.detail || "Kunne ikke opprette resept")
            }
        } catch (error) {
            setLagreError("Kunne ikke koble til server. Prøv igjen.")
        }
    }

    async function oppdaterResept(e) {
        e.preventDefault()
        setLagreError("")
        try {
            const token = sessionStorage.getItem("token")
            const respons = await fetch(`http://127.0.0.1:8000/resept/${redigertReseptID}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mediNavn: redigertMediNavn,
                    dosering: redigertDosering,
                    mengde: redigertMengde,
                    reiterasjoner: redigertReiterasjoner,
                    utlopsdato: redigertUtlopsdato,
                    kommentar: redigertKommentar,
                    status: redigertStatus
                })
            })
            const data = await respons.json()
            if (respons.ok) {
                setRedigertReseptID(null)
                hentResepter()
            } else {
                setLagreError(data.detail || "Kunne ikke oppdatere resept")
            }
        } catch (error) {
            setLagreError("Kunne ikke koble til server. Prøv igjen.")
        }
    }

    async function slettResept(reseptID) {
        try {
            const token = sessionStorage.getItem("token")
            const respons = await fetch(`http://127.0.0.1:8000/resept/${reseptID}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (respons.ok) {
                hentResepter()
            } else {
                const data = await respons.json()
                setFeilmelding(data.detail || "Kunne ikke slette resept")
            }
        } catch (error) {
            setFeilmelding("Kunne ikke koble til server. Prøv igjen.")
        }
    }

    async function fornydResept(resept) {
        try {
            const token = sessionStorage.getItem("token")

            // Hent brukerens userID fra token for å finne legens userID
            const tokenData = JSON.parse(atob(token.split('.')[1]))

            // Hent legens userID fra backend
            const legeRespons = await fetch(`http://127.0.0.1:8000/bruker/lege/${fnr}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const legeData = await legeRespons.json()

            const respons = await fetch("http://127.0.0.1:8000/meldinger", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mottakerID: legeData.userID,
                    overskrift: `Fornyelse av resept: ${resept.mediNavn}`,
                    innhold: `Jeg ønsker å fornye resepten min på ${resept.mediNavn} (${resept.dosering}). Vennligst ta kontakt hvis du trenger mer informasjon.`
                })
            })
            if (respons.ok) {
                alert("Forespørsel om fornyelse sendt til legen din!")
            }
        } catch (error) {
            alert("Kunne ikke sende forespørsel. Prøv igjen.")
        }
    }

    const aktiveResepter = resepter.filter(r => r.status === "aktiv")
    const arkiverteResepter = resepter.filter(r => r.status === "arkivert")
    const viserResepter = aktivFane === "aktiv" ? aktiveResepter : arkiverteResepter

    if (laster) return <p>Laster resepter...</p>
    if (feilmelding) return <p style={{ color: "red" }}>{feilmelding}</p>

    return (
        <div className={styles.container}>

            {/* Fane-toggle */}
            <div className={styles.faneToggle}>
                <button
                    className={`${styles.faneKnapp} ${aktivFane === "aktiv" ? styles.faneAktiv : ""}`}
                    onClick={() => setAktivFane("aktiv")}
                >
                    Aktive resepter
                </button>
                <button
                    className={`${styles.faneKnapp} ${aktivFane === "arkivert" ? styles.faneAktiv : ""}`}
                    onClick={() => setAktivFane("arkivert")}
                >
                    Arkiv
                </button>
            </div>

            {/* Ny resept-knapp (kun lege) */}
            {rolle === "lege" && aktivFane === "aktiv" && (
                <button className={styles.nyKnapp} onClick={() => setVisSkjema(!visSkjema)}>
                    {visSkjema ? "Avbryt" : "+ Aktiver resept"}
                </button>
            )}

            {/* Ny resept-skjema */}
            {visSkjema && (
                <form className={styles.skjema} onSubmit={opprettResept}>
                    <div className={styles.skjemaGrid}>
                        <div className={styles.skjemaFelt}>
                            <label>Medikament</label>
                            <input type="text" value={nyttMediNavn} onChange={(e) => setNyttMediNavn(e.target.value)} required placeholder="Navn på medikament" />
                        </div>
                        <div className={styles.skjemaFelt}>
                            <label>Dosering</label>
                            <input type="text" value={nyDosering} onChange={(e) => setNyDosering(e.target.value)} required placeholder="F.eks. 1 tablett daglig" />
                        </div>
                        <div className={styles.skjemaFelt}>
                            <label>Mengde</label>
                            <input type="text" value={nyMengde} onChange={(e) => setNyMengde(e.target.value)} required placeholder="F.eks. 20 stk" />
                        </div>
                        <div className={styles.skjemaFelt}>
                            <label>Reiterasjoner</label>
                            <input type="number" value={nyReiterasjoner} onChange={(e) => setNyReiterasjoner(parseInt(e.target.value))} min="0" />
                        </div>
                        <div className={styles.skjemaFelt}>
                            <label>Utløpsdato</label>
                            <input type="date" value={nyUtlopsdato} onChange={(e) => setNyUtlopsdato(e.target.value)} required />
                        </div>
                        <div className={styles.skjemaFelt}>
                            <label>Kommentar</label>
                            <input type="text" value={nyKommentar} onChange={(e) => setNyKommentar(e.target.value)} placeholder="Valgfri kommentar" />
                        </div>
                    </div>
                    {lagreError && <p style={{ color: "red" }}>{lagreError}</p>}
                    <button className={styles.lagreKnapp} type="submit">Lagre resept</button>
                </form>
            )}

            {/* Resept-tabell */}
            {viserResepter.length === 0 ? (
                <p className={styles.ingenResepter}>Ingen {aktivFane === "aktiv" ? "aktive" : "arkiverte"} resepter</p>
            ) : (
                <table className={styles.tabell}>
                    <thead>
                        <tr>
                            <th>Medikament</th>
                            <th>Dosering</th>
                            <th>Mengde</th>
                            {rolle === "lege" && <th>Reiterasjoner</th>}
                            <th>Utløpsdato</th>
                            <th>Kommentar</th>
                            {rolle === "lege" && <th>Status</th>}
                            <th>Handling</th>
                        </tr>
                    </thead>
                    <tbody>
                        {viserResepter.map(resept => (
                            <>
                                <tr key={resept.reseptID}>
                                    <td><strong>{resept.mediNavn}</strong></td>
                                    <td>{resept.dosering}</td>
                                    <td>{resept.mengde}</td>
                                    {rolle === "lege" && <td>{resept.reiterasjoner}</td>}
                                    <td>{resept.utlopsdato}</td>
                                    <td>{resept.kommentar || "—"}</td>
                                    {rolle === "lege" && <td>{resept.status}</td>}
                                    <td>
                                        {rolle === "lege" ? (
                                            <div className={styles.handlingKnapper}>
                                                <button className={styles.redigerKnapp} onClick={() => {
                                                    setRedigertReseptID(resept.reseptID)
                                                    setRedigertMediNavn(resept.mediNavn)
                                                    setRedigertDosering(resept.dosering)
                                                    setRedigertMengde(resept.mengde)
                                                    setRedigertReiterasjoner(resept.reiterasjoner)
                                                    setRedigertUtlopsdato(resept.utlopsdato)
                                                    setRedigertKommentar(resept.kommentar || "")
                                                    setRedigertStatus(resept.status)
                                                }}>✏️ Rediger</button>
                                                <button className={styles.slettKnapp} onClick={() => slettResept(resept.reseptID)}>🗑️ Slett</button>
                                            </div>
                                        ) : (
                                            <button className={styles.fornydKnapp} onClick={() => fornydResept(resept)}>Forny</button>
                                        )}
                                    </td>
                                </tr>
                                {rolle === "lege" && redigertReseptID === resept.reseptID && (
                                    <tr key={`rediger-${resept.reseptID}`}>
                                        <td colSpan="8">
                                            <form className={styles.endreSkjema} onSubmit={oppdaterResept}>
                                                <div className={styles.skjemaGrid}>
                                                    <div className={styles.skjemaFelt}>
                                                        <label>Medikament</label>
                                                        <input type="text" value={redigertMediNavn} onChange={(e) => setRedigertMediNavn(e.target.value)} required />
                                                    </div>
                                                    <div className={styles.skjemaFelt}>
                                                        <label>Dosering</label>
                                                        <input type="text" value={redigertDosering} onChange={(e) => setRedigertDosering(e.target.value)} required />
                                                    </div>
                                                    <div className={styles.skjemaFelt}>
                                                        <label>Mengde</label>
                                                        <input type="text" value={redigertMengde} onChange={(e) => setRedigertMengde(e.target.value)} required />
                                                    </div>
                                                    <div className={styles.skjemaFelt}>
                                                        <label>Reiterasjoner</label>
                                                        <input type="number" value={redigertReiterasjoner} onChange={(e) => setRedigertReiterasjoner(parseInt(e.target.value))} min="0" />
                                                    </div>
                                                    <div className={styles.skjemaFelt}>
                                                        <label>Utløpsdato</label>
                                                        <input type="date" value={redigertUtlopsdato} onChange={(e) => setRedigertUtlopsdato(e.target.value)} required />
                                                    </div>
                                                    <div className={styles.skjemaFelt}>
                                                        <label>Kommentar</label>
                                                        <input type="text" value={redigertKommentar} onChange={(e) => setRedigertKommentar(e.target.value)} />
                                                    </div>
                                                    <div className={styles.skjemaFelt}>
                                                        <label>Status</label>
                                                        <select value={redigertStatus} onChange={(e) => setRedigertStatus(e.target.value)}>
                                                            <option value="aktiv">Aktiv</option>
                                                            <option value="arkivert">Arkivert</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {lagreError && <p style={{ color: "red" }}>{lagreError}</p>}
                                                <div className={styles.endreKnapper}>
                                                    <button className={styles.lagreKnapp} type="submit">Lagre endring</button>
                                                    <button className={styles.avbrytKnapp} type="button" onClick={() => setRedigertReseptID(null)}>Avbryt</button>
                                                </div>
                                            </form>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default JournalMedikament