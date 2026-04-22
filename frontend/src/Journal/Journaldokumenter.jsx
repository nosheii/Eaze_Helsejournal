/* Sofie Kure - 273800 og Aurora Krogstad - 261696 */
import { Funnel } from "lucide-react";
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

// JournalDokumenter viser alle journaldokumenter for en pasient
// Legen kan opprette nye dokumenter, pasienten kan bare lese
function JournalDokumenter({ journalNr, fnr, rolle, onTokenFeil }) {    
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
    const [kritiskInfo, setKritiskInfo] = useState([]);
    const [visKritisk, setVisKritisk] = useState(false);

    useEffect(() => {
        if (journalNr) hentDokumenter();
    }, [journalNr]);

    // Henter kritisk info om pasienten for å vise i skjema-visningen
    useEffect(() => {
        if (!fnr) return;
        fetch(`${API}/pasient/${fnr}/info`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401) {
                    onTokenFeil();
                    return;
                }
                return res.json();
            })
            // data.kritisk_info er en liste med strenger som vises i kritiskInfoBlok
            .then(data => setKritiskInfo(data.kritisk_info))
            .catch(() => {});
    }, [fnr]);

    // Henter alle dokumenter tilknyttet denne journalen fra backend
    async function hentDokumenter() {
        setLaster(true);
        setFeil(null);
        try {
            const res = await fetch(`${API}/dokument/${journalNr}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                onTokenFeil();
                return;
            }
            if (!res.ok) throw new Error("Kunne ikke hente dokumenter");
            const data = await res.json();
            setDokumenter(data.dokumenter);
        } catch (e) {
            setFeil(e.message);
        } finally {
            setLaster(false);
        }
    }

    // Lagrer et nytt dokument. Teksten serialiseres som JSON siden
    // dokumentet inneholder flere felt (subjektivt, objektivt, osv.)
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
                // JSON.stringify(skjema) konverterer skjema-objektet til en tekststreng
                // slik at hele dokumentet kan lagres i én tekstkolonne i databasen
                body: JSON.stringify({ journalNr, tekst: JSON.stringify(skjema) }),
            });
            if (res.status === 401) { onTokenFeil(); return; }
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

    // Veksler mellom ekspandert og kollapset visning for et dokument i listen
    function toggleEkspander(id) {
        setEkspandert(ekspandert === id ? null : id);
    }

    // Filtrerer dokumenter basert på dato hvis filter er satt
    const filtrert = dokumenter.filter((dok) => {
        if (!fraFilter && !tilFilter) return true;
        const dato = new Date(dok.opprettetDato);
        if (fraFilter && dato < new Date(fraFilter)) return false;
        if (tilFilter && dato > new Date(tilFilter)) return false;
        return true;
    });

    // Kritisk info-blokk som vises i skjema og åpent dokument
    // slik at legen alltid har tilgang til viktig pasientinfo under skriving
    const kritiskInfoBlokk = (
        <div className={styles.skjemaHoyre}>
            <span className={styles.kritiskInfoTittel}>Kritisk info:</span>
            <button
                className={styles.kritiskKnapp}
                onClick={() => setVisKritisk(!visKritisk)}
            >
                {visKritisk ? "▲ Skjul" : "▼ Vis kritisk info"}
            </button>
            {visKritisk && (
                <ul className={styles.kritiskListe}>
                    {kritiskInfo.length === 0
                        ? <li>Ingen kritisk info registrert</li>
                        : kritiskInfo.map((item, i) => <li key={i}>{item}</li>)
                    }
                </ul>
            )}
        </div>
    );

    // --- Opprett skjema --- vises når legen klikker "Opprett nytt dokument"
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
                    {kritiskInfoBlokk}
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

    // --- Åpent dokument --- vises når legen klikker "Åpne" på et dokument
    if (apentDokument) {
        // JSON.parse brukes for å konvertere tekststrengen tilbake til et objekt
        // try/catch håndterer eldre dokumenter som ikke er lagret som JSON
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
                    {kritiskInfoBlokk}
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

    // --- Dokumentliste --- hovedvisningen med alle dokumenter i en tabell
    if (laster) return <p>Laster dokumenter...</p>;
    if (feil) return <p>{feil}</p>;

    return (
        <div className={styles.kontainer}>
            {rolle !== "pasient" && (
                <button className={styles.opprettKnapp} onClick={() => setVisSkjema(true)}>
             Opprett nytt dokument +
            </button>
            )}

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
                <button className={styles.filterLogo}>{<Funnel />}</button>
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