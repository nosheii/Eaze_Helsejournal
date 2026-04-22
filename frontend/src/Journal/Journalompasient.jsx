/* Sofie Kure - 273800 */
import { useState, useEffect } from "react";
import styles from "./JournalOmPasient.module.css";

// JournalOmPasient viser og lar legen redigere generell info og kritisk info om pasienten
function JournalOmPasient({ fnr, rolle, onTokenFeil }) {
    // omPasient og kritiskInfo er lister med tekststrenger hentet fra backend    
    const [omPasient, setOmPasient] = useState([]);
    const [kritiskInfo, setKritiskInfo] = useState([]);
    const [laster, setLaster] = useState(true);
    const [feil, setFeil] = useState(null);
    const [redigerer, setRedigerer] = useState(false);
    


    const token = sessionStorage.getItem("token");

    // useEffect kjører når fnr endres, og henter pasientinfo fra backend
    useEffect(() => {
        if (!fnr) return;
        setLaster(true);
        setFeil(null);

        fetch(`http://localhost:8000/pasient/${fnr}/info`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => {
            if (res.status === 401) {
                onTokenFeil();
                return;
            }
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

    // lagre() sender oppdatert pasientinfo til backend med PUT-request
    function lagre() {
        fetch(`http://localhost:8000/pasient/${fnr}/info`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                om_pasient: omPasient,
                kritisk_info: kritiskInfo,
            }),
        })
        .then((res) => {
            if (res.status === 401) {
                onTokenFeil();
                return;
            }
        });
        setRedigerer(false);
    }

    // oppdater() er en hjelpefunksjon for å oppdatere ett element i en liste
    // uten å mutere den originale listen direkte
    function oppdater(liste, setListe, index, verdi) {
        const ny = [...liste];
        ny[index] = verdi;
        setListe(ny);
    }

    if (laster) return <p>Laster...</p>;
    if (feil) return <p>Feil: {feil}</p>;

    return (
    <div className={styles.wrapper}>
        <div className={styles.side}>
            <div className={styles.kort}>
                <h2 className={styles.tittel}><b>Om pasient:</b></h2>
                {/* Viser hvert element i listen, enten som tekst eller som input i redigeringsmodus */}
                <ul>
                    {omPasient.map((item, i) => (
                        <li key={i}>
                            {redigerer
                                ? <><input value={item} onChange={(e) => oppdater(omPasient, setOmPasient, i, e.target.value)} />
                                   <button onClick={() => setOmPasient(omPasient.filter((_, j) => j !== i))}>Fjern</button></>
                                : <span>{item}</span>
                            }
                        </li>
                    ))}
                </ul>
                {redigerer && <button onClick={() => setOmPasient([...omPasient, ""])}>+ Legg til</button>}
            </div>

            <div className={styles.kort}>
                <h2 className={styles.tittel}><b>Kritisk info:</b></h2>
                <ul>
                    {kritiskInfo.map((item, i) => (
                        <li key={i}>
                            {redigerer
                                ? <><input value={item} onChange={(e) => oppdater(kritiskInfo, setKritiskInfo, i, e.target.value)} />
                                   <button onClick={() => setKritiskInfo(kritiskInfo.filter((_, j) => j !== i))}>Fjern</button></>
                                : <span>{item}</span>
                            }
                        </li>
                    ))}
                </ul>
                {redigerer && <button onClick={() => setKritiskInfo([...kritiskInfo, ""])}>+ Legg til</button>}
            </div>
        </div>
        {/* Rediger/Lagre-knappen vises kun for leger, ikke pasienter */}
        {rolle !== "pasient" && (
            redigerer
                ? <button className={styles.redigerKnapp} onClick={lagre}>Lagre</button>
                : <button className={styles.redigerKnapp} onClick={() => setRedigerer(true)}>Rediger</button>
        )}
    </div>
);
}

export default JournalOmPasient;