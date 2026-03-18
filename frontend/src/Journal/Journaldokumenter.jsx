import { useState, useEffect } from "react";
import styles from "./Journaldokumenter.module.css";

const API = "http://127.0.0.1:8000";

const tomtSkjema = {
    dokumentnavn: "",
    kategori: "Konsultasjonsnotat",
    subjektivt: "",
    objektivt: "",
    vurdering: "",
    plan: "",
    kommentar: "",
};

function JournalDokumenter({ journalNr }) {
    const token = sessionStorage.getItem("token");

    const [dokumenter, setDokumenter] = useState([]);
    const [laster, setLaster] = useState(true);
    const [feil, setFeil] = useState(null);
    const [ekspandert, setEkspandert] = useState(null);
    const [fraFilter, setFraFilter] = useState("");
    const [tilFilter, setTilFilter] = useState("");
    const [visSkjema, setVisSkjema] = useState(false);
    const [skjema, setSkjema] = useState(tomtSkjema);
    const [lagrer, setLagrer] = useState(false);
    const [apentDokument, setApentDokument] = useState(null); 

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

    async function lagreDokument() {
        if (!skjema.dokumentnavn.trim()) {
            alert("Dokumentnavn er påkrevd");
            return;
        }
        setLagrer(true);
        try {
            const res = await fetch(`${API}/dokument`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ journalNr, tekst: JSON.stringify(skjema) }),
            });
            if (!res.ok) throw new Error("Kunne ikke lagre dokument");
            setVisSkjema(false);
            setSkjema(tomtSkjema);
            await hentDokumenter();
        } catch (e) {
            alert(e.message);
        } finally {
            setLagrer(false);
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

    // --- Opprett skjema ---
    if (visSkjema) {
        return (
            <div className={styles.kontainer}>
                <div className={styles.skjemaTopp}>
                    <div className={styles.skjemaVenstre}>
                        <input
                            className={styles.dokumentNavnInput}
                            placeholder="Dokumentnavn"
                            value={skjema.dokumentnavn}
                            onChange={(e) => setSkjema({ ...skjema, dokumentnavn: e.target.value })}
                        />
                        <select
                            className={styles.kategoriValg}
                            value={skjema.kategori}
                            onChange={(e) => setSkjema({ ...skjema, kategori: e.target.value })}
                        >
                            <option>Konsultasjonsnotat</option>
                            <option>Sykepleienotat</option>
                            <option>Epikrise</option>
                            <option>Henvisning</option>
                            <option>Prøvesvar</option>
                            <option>Resept</option>
                        </select>
                    </div>

                    <div className={styles.skjemaHoyre}>
                        <span className={styles.kritiskInfoTittel}>Kritisk info:</span>
                        <div className={styles.kritiskKnapper}>
                            <button className={styles.kritiskKnapp}>Allergi</button>
                            <button className={styles.kritiskKnapp}>HLR</button>
                            <button className={styles.kritiskKnapp}>Smitte</button>
                        </div>
                        <p className={styles.kritiskInfoTekst}>Ingen kritisk info registrert enda</p>
                    </div>
                </div>

                <div className={styles.soapGrid}>
                    {["subjektivt", "vurdering", "objektivt", "plan"].map((felt) => (
                        <div key={felt} className={styles.soapFelt}>
                            <label className={styles.soapLabel}>
                                {felt.charAt(0).toUpperCase() + felt.slice(1)}:
                            </label>
                            <textarea
                                className={styles.soapInput}
                                value={skjema[felt]}
                                onChange={(e) => setSkjema({ ...skjema, [felt]: e.target.value })}
                            />
                        </div>
                    ))}
                </div>

                <textarea
                    className={styles.kommentarInput}
                    placeholder="Kommentar/tilleggsinfo"
                    value={skjema.kommentar}
                    onChange={(e) => setSkjema({ ...skjema, kommentar: e.target.value })}
                />

                <div className={styles.skjemaKnapper}>
                    <button className={styles.lagreKnapp} onClick={lagreDokument} disabled={lagrer}>
                        {lagrer ? "Lagrer..." : "Lagre dokument"}
                    </button>
                    <button className={styles.avbrytKnapp} onClick={() => { setVisSkjema(false); setSkjema(tomtSkjema); }}>
                        Avbryt
                    </button>
                </div>
            </div>
        );
    }

    if (apentDokument) {
    const innhold = (() => {
        try { return JSON.parse(apentDokument.tekst); }
        catch { return {}; }
    })();

    return (
        <div className={styles.kontainer}>
            <button className={styles.avbrytKnapp} onClick={() => setApentDokument(null)}>
                ← Tilbake
            </button>

            <div className={styles.skjemaTopp}>
                <div className={styles.skjemaVenstre}>
                    <p><strong>Dokumentnavn:</strong> {innhold.dokumentnavn}</p>
                    <p><strong>Kategori:</strong> {innhold.kategori}</p>
                </div>
                <div className={styles.skjemaHoyre}>
                    <span className={styles.kritiskInfoTittel}>Kritisk info:</span>
                    <div className={styles.kritiskKnapper}>
                        <button className={styles.kritiskKnapp}>Allergi</button>
                        <button className={styles.kritiskKnapp}>HLR</button>
                        <button className={styles.kritiskKnapp}>Smitte</button>
                    </div>
                </div>
            </div>

            <div className={styles.soapGrid}>
                {["subjektivt", "vurdering", "objektivt", "plan"].map((felt) => (
                    <div key={felt} className={styles.soapFelt}>
                        <label className={styles.soapLabel}>
                            {felt.charAt(0).toUpperCase() + felt.slice(1)}:
                        </label>
                        <p>{innhold[felt] || "—"}</p>
                    </div>
                ))}
            </div>

            <div className={styles.kommentarInput}>
                <strong>Kommentar:</strong> {innhold.kommentar || "—"}
            </div>
        </div>
    );
}

    // --- Dokumentliste ---
    if (laster) return <p>Laster dokumenter...</p>;
    if (feil) return <p>{feil}</p>;

    return (
        <div className={styles.kontainer}>
            <button className={styles.opprettKnapp} onClick={() => setVisSkjema(true)}>
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
                <button className={styles.filterKnapp}>Filter 🔍</button>
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
                                        <span><strong>Dato opprettet:</strong></span>
                                        <span>{dok.opprettetDato}</span>
                                    </div>
                                    <button className={styles.apneKnapp} onClick={() => setApentDokument(dok)}>Åpne</button>
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