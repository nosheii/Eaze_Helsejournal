// Ana María Araya Flores -273762
// Viser informasjon om nettsiden og hvordan den fungerer, litt om oss :)

import styles from "./Informasjon.module.css";

function Informasjon() {
    return (
        <div className={styles.informasjonSide}>
            <h1 className={styles.informasjonTittel}>Eaze - Helsejournal</h1>
            <div className={styles.informasjonBoks}>
                <h2>Studentprosjekt ved USN - gruppe 11</h2>
                <br />
                <h3>Om prosjektet</h3>
                <p>Eaze er en moderne helsejournal-applikasjon utviklet som en del av et studentprosjekt ved USN.
                    Målet med Eaze har vært å lage et system som gjør kommunikasjonen mellom lege og pasient
                    enklere, mer oversiktlig og tilgjengelig for alle. <strong>Alle brukere og data er fiktive.</strong></p>
                <br />
                <p>Navnet <strong> Eaze </strong> reflekterer kjerneverdien i prosjektet - enkelhet. Vi ønsket å lage en løsning
                    som føles naturlig å bruke, uten unødvendig kompleksitet. Pasienter skal enkelt kunne holde
                    seg oppdatert på egen helse, mens leger får et ryddig verktøy for å administrere journaler,
                    resepter og avtaler.</p>
                <br />
                <p>Selv om Eaze er et skoleprosjekt — er det et gjennomtenkt konsept vi har tatt på alvor
                    fra første strek til siste linje med kode.</p>

                <br />
                <h3>Teknologi</h3>
                <p>Eaze er bygget med <strong>React</strong> og <strong>Vite</strong> på frontend, med CSS Modules for styling.
                    Backend er utviklet med <strong>FastAPI</strong> og <strong>Python</strong>, og kommuniserer med en <strong>SQLite</strong>-database.
                    Applikasjonen har et tydelig rollebasert system der leger og pasienter får ulike visninger og tilganger
                    tilpasset deres behov. All kommunikasjon mellom frontend og backend er sikret med <strong>JWT-autentisering</strong>,
                    slik at sensitive data er beskyttet mot uautorisert tilgang.</p>

                <br />
                <h3>Utviklere</h3>
                <p>Nora, Tilda, Sofie, Aurora, Ana María og Mumtaz.</p>
            </div>
        </div>
    )
}

export default Informasjon
