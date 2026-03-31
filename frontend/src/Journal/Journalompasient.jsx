import { useState, useEffect } from "react";
import styles from "./JournalOmPasient.module.css";

function JournalOmPasient({ fnr }) {
    const [omPasient, setOmPasient] = useState([]);
    const [kritiskInfo, setKritiskInfo] = useState([]);
    const [laster, setLaster] = useState(true);
    const [feil, setFeil] = useState(null);
    const [redigerer, setRedigerer] = useState(false);


    const token = sessionStorage.getItem("token");

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
    });
    setRedigerer(false);
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

        {redigerer
            ? <button onClick={lagre}>Lagre</button>
            : <button onClick={() => setRedigerer(true)}>Rediger</button>
        }
    </div>
);
}

export default JournalOmPasient;