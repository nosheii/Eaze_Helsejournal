// Viser informasjon om nettsiden og hvordan den fungerer, litt om oss :)

import styles from "./Informasjon.module.css";

function Informasjon() {
    return (
        <div className={styles.informasjonSide}>
            <h1 className={styles.informasjonTittel}>Eaze - Helsejournal</h1>
            <div className={styles.informasjonBoks}>
                <h2>Studentprosjekt ved USN. gruppe 11</h2>
                <h3> Nora, Tilda, Sofie, Aurora, Ana María og Mumtaz.</h3>  
                <p>Eaze er en moderne helsejournal-applikasjon utviklet som en del av et studentprosjekt ved USN. 
                    Målet med Eaze har vært å lage et system som gjør kommunikasjonen mellom lege og pasient 
                    enklere, mer oversiktlig og tilgjengelig for alle.</p>
 
                <p>Navnet <strong> Eaze </strong> reflekterer kjerneverdien i prosjektet - enkelhet. Vi ønsket å lage en løsning 
                som føles naturlig å bruke, uten unødvendig kompleksitet. Pasienter skal enkelt kunne holde 
                seg oppdatert på egen helse, mens leger får et ryddig verktøy for å administrere journaler, 
                resepter og avtaler.</p>
 
                <p>Applikasjonen er bygget med et tydelig rollebasert system — leger og pasienter får ulike 
                visninger og tilganger tilpasset deres behov. All kommunikasjon mellom frontend og backend 
                er sikret med JWT-autentisering, og sensitive data er beskyttet mot uautorisert tilgang.</p>
 
                <p>Selv om Eaze er et skoleprosjekt — er det et gjennomtenkt konsept vi har tatt på alvor 
                fra første strek til siste linje med kode.</p>

            </div>
        </div>            
    )
}

export default Informasjon
