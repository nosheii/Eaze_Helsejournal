import styles from "../Vaksine.module.css";
import { useState, useEffect } from "react";
function JournalVaksiner({ fnr, rolle }) {
    const [vaksine, setVaksine] = useState([]);
    const [visModal, setVisModal] = useState(false);
    const [nyVaksine, setNyVaksine] = useState({vaksineNavn: "", dato: ""});

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
        setVaksine([...vaksine, {vaksineID: data.vaksineID, vaksineNavn: nyVaksine.vaksineNavn, dato: nyVaksine.dato}]);
        // Lukk modalen
        setVisModal(false);
        // Tøm input-feltene
        setNyVaksine({vaksineNavn: "", dato: ""});
    });
}
    return (
    <div className={styles.vaksineKort}>
                    <div className={styles.vaksineHeader}>
                        <h2>Vaksinehistorikk</h2>
                            {rolle === "lege" && (
                                    <button className={styles.vaksineKnapp} onClick={() => setVisModal(true)}>+ Legg til vaksine
                                    </button>
                                )}
                        </div>
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
                                            <td className={styles.dato}>{v.dato.replace(/-/g, ".")}</td>
                                        </tr>
                                    ))}    
                                </tbody>
                            </table>
                        </div>
                    {visModal && ( // viser modal for å opprette ny vaksine
                        <div className={styles.modal}>
                            <div className={styles.modalInnhold}>
                                <h2>Legg til vaksine</h2>
                                <input
                                    type="text"
                                    placeholder="Vaksinenavn"
                                    value={nyVaksine.vaksineNavn}
                                    onChange={(e) => setNyVaksine({...nyVaksine, vaksineNavn: e.target.value})}
                                />
                                <input
                                    type="date"
                                    value={nyVaksine.dato}
                                    onChange={(e) => setNyVaksine({...nyVaksine, dato: e.target.value})}
                                />
                                <button onClick={() => setVisModal(false)}>Lukk</button>
                                <button onClick={lagreNyVaksine}>Lagre</button>
                            </div>
                        </div>
                    )}
                    </div>
                );
            }

export default JournalVaksiner;
