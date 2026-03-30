// Viser informasjon om nettsiden og hvordan den fungerer, litt om oss :)
// Lege har knapp for å legge til vaksine

import styles from "./Informasjon.module.css";

function Informasjon() {
    return (
        <div className={styles.informasjonSide}>
            <h1 className={styles.informasjonTittel}>Informasjon</h1>
            <div className={styles.informasjonBoks}>
                <h2>Om EAZE</h2>    
                <p>EAZE er en digital pasientjournal utviklet med tanke på både pasienter og helsepersonell, og har som mål å forbedre kommunikasjonen og samarbeidet mellom disse gruppene.
                    Pasienter kan enkelt få tilgang til sin egen journal, mens helsepersonell kan bruke den til å dokumentere og dele informasjon om pasientens helse.</p>
                <p>Vår pasientjournal er designet for å være brukervennlig og intuitiv, slik at både pasienter og helsepersonell kan navigere og bruke den uten problemer.
                    Vi håper at vår pasientjournal kan bidra til å forbedre helsetjenester og gjøre det enklere for alle å få tilgang til viktig helseinformasjon.</p>
                <p><strong> EAZE er et skoleprosjekt i emnet APP2000 tatt ved USN Ringerike skoleåret H2025/V2026.</strong></p>
            </div>
        </div>            
    )
}

export default Informasjon
