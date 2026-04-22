// Ana María Araya Flores, - 273762

// Viser vaksinehistorikk for pasient i journalen.
// Henter paisentens fnr og rolle som props fra Journal.jsx
// Lege kan legge til nye vaksiner.

import styles from "../Vaksine.module.css";
import { useState, useEffect } from "react";
function JournalVaksiner({ fnr, rolle }) {
    const [vaksine, setVaksine] = useState([]);
    const [visModal, setVisModal] = useState(false);
    const [nyVaksine, setNyVaksine] = useState({ vaksineNavn: "", dato: "" });

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!fnr) return;
        fetch(`http://localhost:8000/vaksine/${fnr}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setVaksine(data.vaksine);
            });

    }, [fnr]);

    function lagreNyVaksine() {
        const token = sessionStorage.getItem("token");
        fetch("http://localhost:8000/vaksine", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fnr: fnr,
                vaksineNavn: nyVaksine.vaksineNavn,
                dato: nyVaksine.dato
            })
        })
            .then(res => res.json())
            .then(data => {
                // Oppdater vaksine-listen med den nye vaksinen
                setVaksine([...vaksine, { vaksineID: data.vaksineID, vaksineNavn: nyVaksine.vaksineNavn, dato: nyVaksine.dato }]);
                // Lukk modalen
                setVisModal(false);
                // Tøm input-feltene
                setNyVaksine({ vaksineNavn: "", dato: "" });
            });
    }
    return (
        <div className={styles.vaksineKort}>
            <div className={styles.vaksineHeader}>
                <h2>Vaksinehistorikk</h2>
                {rolle === "lege" && (
                    <button className={styles.vaksineKnapp} onClick={() => setVisModal(!visModal)}>
                        {visModal ? "Avbryt" : "+ Legg til vaksine"}
                    </button>
                )}
            </div>

            {visModal && ( // viser popup-vindu for å opprette ny vaksine
                <div className={styles.vaksineSkjema}>
                    <div className={styles.vaksineInnhold}>
                        <div className={styles.vaksineFelt}>
                            <div>
                                <label>VAKSINENAVN</label>
                                <input
                                    type="text"
                                    placeholder="Vaksinenavn"
                                    value={nyVaksine.vaksineNavn}
                                    onChange={(e) => setNyVaksine({ ...nyVaksine, vaksineNavn: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>DATO</label>
                                <input
                                    type="date"
                                    value={nyVaksine.dato}
                                    onChange={(e) => setNyVaksine({ ...nyVaksine, dato: e.target.value })}
                                />
                            </div>
                            <button className={styles.lagreKnapp} onClick={lagreNyVaksine}>Lagre</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.vaksineScrollbar}>
                <table className={styles.vaksineTabell}>
                    <thead>
                        <tr>
                            <th>Vaksinasjon</th>
                            <th className={styles.dato}>Vaksinasjonsdato</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vaksine.map(v => ( // går og viser hver vaksine i en tabellrad
                            <tr key={v.vaksineID}>
                                <td><strong>{v.vaksineNavn}</strong></td>
                                <td className={styles.dato}>{v.dato}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default JournalVaksiner;
