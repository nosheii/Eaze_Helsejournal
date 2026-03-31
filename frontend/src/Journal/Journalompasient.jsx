import { useState, useEffect } from "react";
import styles from "./JournalOmPasient.module.css";
 
function JournalOmPasient({ fnr }) {
    const [omPasient, setOmPasient] = useState([]);
    const [kritiskInfo, setKritiskInfo] = useState([]);
    const [laster, setLaster] = useState(true);
    const [feil, setFeil] = useState(null);
 
    useEffect(() => {
        if (!fnr) return;
        setLaster(true);
        setFeil(null);
 
        fetch(`/pasient/${fnr}/info`)
            .then((res) => {
                if (!res.ok) throw new Error("Klarte ikke hente pasientinfo");
                return res.json();
            })
            .then((data) => {
                setOmPasient(data.om_pasient);
                setKritiskInfo(data.kritisk_info);
            })
            .catch((e) => setFeil(e.message))
            .finally(() => setLaster(false));
    }, [fnr]);
 
    function lagre() {
        fetch(`/pasient/${fnr}/info`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                om_pasient: omPasient,
                kritisk_info: kritiskInfo,
            }),
        });
    }
 
    function oppdater(liste, setListe, index, verdi) {
        const ny = [...liste];
        ny[index] = verdi;
        setListe(ny);
    }
 
    if (laster) return <p>Laster...</p>;
    if (feil) return <p>Feil: {feil}</p>;
 
    return (
        <div className={styles.side}>
            <div className={styles.kort}>
                <h2 className={styles.tittel}><b>Om pasient:</b></h2>
                <ul>
                    {omPasient.map((item, i) => (
                        <li key={i}>
                            <input
                                value={item}
                                onChange={(e) => oppdater(omPasient, setOmPasient, i, e.target.value)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
 
            <div className={styles.kort}>
                <h2 className={styles.tittel}><b>Kritisk info:</b></h2>
                <ul>
                    {kritiskInfo.map((item, i) => (
                        <li key={i}>
                            <input
                                value={item}
                                onChange={(e) => oppdater(kritiskInfo, setKritiskInfo, i, e.target.value)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
 
            <button onClick={lagre}>Lagre</button>
        </div>
    );
}
 
export default JournalOmPasient;