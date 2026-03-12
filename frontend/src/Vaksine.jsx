// Viser vaksinehistorikk for pasient
// Lege har knapp for å legge til vaksine

import {useState, useEffect} from "react";
import styles from "./Vaksine.module.css";

export function Vaksine ({brukerinfo, rolle}) {
    const[vaksine, setVaksine] = useState([]) //lagrer vaksiner
    const fnr = brukerinfo?.fnr

    useEffect(() => {   
        // henter JWT-token for å bekrefte innlogging
        const token = sessionStorage.getItem("token")

        function hentVaksine() {
            if (!fnr) return; // hvis fnr ikke er tilgjengelig, gjør ingenting
            fetch(`http://localhost:8000/vaksine/${fnr}`, { // sender GET-forespørsel til backend
                headers: {
                    "Authorization": `Bearer ${token}` //innlogging
                     }
                })
                .then(res => res.json()) // konverterer responsen til JSON
                .then(data => {
                    setVaksine(data.vaksine) // oppdaterer vaksine state med data fra backend
                })
        }
        hentVaksine() //kaller funksjonen for å hente vaksiner

    }, [fnr]) //starter på nytt hvis fnr endres

    return (
        <div className={styles.vaksineSide}>
            <div className={styles.vaksineKort}>
                <div className={styles.vaksineHeader}>
                    <h2>Vaksinehistorikk</h2>
                    {rolle === "lege" && (
                        <button className={styles.vaksineKnapp}> + Legg til vaksine
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
                                    <td className={styles.dato}>{v.dato}</td>
                                </tr>
                            ))}    
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default Vaksine;