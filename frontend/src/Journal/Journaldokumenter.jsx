import { useState, useEffect } from "react";
import styles from "./Journaldokumenter.module.css";

const API = "http://127.0.0.1:8000";

function JournalDokumenter({ journalNr }) {
    const token = sessionStorage.getItem("token");

    const [dokumenter, setDokumenter] = useState([]);
    const [laster, setLaster] = useState(true);
    const [feil, setFeil] = useState(null);
    const [ekspandert, setEkspandert] = useState(null);
    const [fraFilter, setFraFilter] = useState("");
    const [tilFilter, setTilFilter] = useState("");

    useEffect(() => {
        if (journalNr) hentDokumenter();
    }, [journalNr]);

    async function hentDokumenter() {
        setLaster(true);
        setFeil(null);
        try {
            const res = await fetch(`${API}/dokument/${journalNr}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Kunne ikke hente dokumenter");
            const data = await res.json();
            setDokumenter(data.dokumenter);
        } catch (e) {
            setFeil(e.message);
        } finally {
            setLaster(false);
        }
    }

    function toggleEkspander(id) {
        setEkspandert(ekspandert === id ? null : id);
    }

    const filtrert = dokumenter.filter((dok) => {
        if (!fraFilter && !tilFilter) return true;
        const dato = new Date(dok.opprettetDato);
        if (fraFilter && dato < new Date(fraFilter)) return false;
        if (tilFilter && dato > new Date(tilFilter)) return false;
        return true;
    });

    if (laster) return <p>Laster dokumenter...</p>;
    if (feil) return <p>{feil}</p>;

    return (
        <div className={styles.kontainer}>
            <button className={styles.opprettKnapp}>
                Opprett nytt dokument +
            </button>

            <div className={styles.filterRad}>
                <span className={styles.filterLabel}>Finn dokument fra periode:</span>
                <input
                    type="date"
                    className={styles.filterInput}
                    value={fraFilter}
                    onChange={(e) => setFraFilter(e.target.value)}
                />
                <span>→</span>
                <input
                    type="date"
                    className={styles.filterInput}
                    value={tilFilter}
                    onChange={(e) => setTilFilter(e.target.value)}
                />
                <button className={styles.filterKnapp}>Filter</button>
            </div>

            <div className={styles.listeHeader}>
                <span>Dato</span>
                <span>Dokumentnavn</span>
                <span>Kategori</span>
                <span>Undertype</span>
                <span></span>
            </div>

            {filtrert.length === 0 ? (
                <p className={styles.ingenDokumenter}>Ingen dokumenter funnet</p>
            ) : (
                filtrert.map((dok) => {
                    const innhold = (() => {
                        try { return JSON.parse(dok.tekst); }
                        catch { return { dokumentnavn: dok.tekst, kategori: "—", undertype: "—" }; }
                    })();

                    return (
                        <div key={dok.dokumentID} className={styles.dokumentRad}>
                            <div
                                className={styles.dokumentRadHoved}
                                onClick={() => toggleEkspander(dok.dokumentID)}
                            >
                                <span>{dok.opprettetDato}</span>
                                <span>{innhold.dokumentnavn || "—"}</span>
                                <span>{innhold.kategori || "—"}</span>
                                <span>{innhold.undertype || "—"}</span>
                                <span className={styles.pil}>
                                    {ekspandert === dok.dokumentID ? "∧" : "∨"}
                                </span>
                            </div>

                            {ekspandert === dok.dokumentID && (
                                <div className={styles.dokumentDetaljer}>
                                    <div className={styles.detaljerVenstre}>
                                        <span><strong>Forfatter:</strong></span>
                                        <span>{dok.legeNavn || "—"}</span>
                                    </div>
                                    <div className={styles.detaljerMidt}>
                                        <span><strong>Klokkeslett opprettet:</strong></span>
                                        <span>{dok.opprettetDato}</span>
                                    </div>
                                    <button className={styles.apneKnapp}>Åpne</button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default JournalDokumenter;