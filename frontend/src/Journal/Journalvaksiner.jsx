import styles from "../Vaksine.module.css";
import { useState, useEffect } from "react";
function JournalVaksiner({ fnr }) {
    const [vaksine, setVaksine] = useState([]);

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

    return (
        <div className={styles.vaksineKort}>
                        <div className={styles.vaksineHeader}>
                            <h2>Vaksinehistorikk</h2>
                                <button className={styles.vaksineKnapp}> + Legg til vaksine
                                </button>
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
