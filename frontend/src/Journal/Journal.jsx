// Journal.jsx
// Hovedkomponenten for alle journal fanene.
// Denne skal ha ansvar for å vite hvilken fane er valgt og vise riktig innhold basert på onClick
// Logikken på de andre fanene er delt opp i underkomponenter for 
// å holde det mer ryddig og mindre kaotisk

import { useState } from "react"; 
import styles from "./Journal.module.css";

//Her importeres underkomponenetene for hver faen.
import JournalOmPasient from "./JournalOmPasient";
import JournalMedikament from "./JournalMedikament";
import JournalVaksiner from "./JournalVaksiner";
import JournalDokumenter from "./JournalDokumenter";
import JournalHistorikk from "./JournalHistorikk";

function Journal() {
  const [valgtFane, setValgtFane] = useState("pasientInfo");

  // Placeholder-pasient
  const pasient = {
    fnr: "120119931234",
    navn: "Malik, Zayn",
    detaljer: "12.01.1993 (33år) – Mann"
  };

  return (
    <div className={styles.side}> {/* bakerste container for siden, setter bakgrunnsfarge og padding */}
      <div className={styles.innhold}> {/* container for selve innholdet på siden, setter max-width og sentrerer */}

        {/*Pasient header med navn og detaljer*/}
        <div className={styles.pasientHeader}>
          <span className={styles.pasientNavn}>{pasient.navn}</span>
          <span className={styles.pasientDetaljer}> – {pasient.detaljer}</span>
        </div>

        {/* De ulike fanenene*/}
        <div className={styles.faneKontainer}>
          <div className={styles.faneRad}>
            <button
              className={`${styles.fane} ${valgtFane === "pasientInfo" ? styles.faneAktiv : ""}`}
              onClick={() => setValgtFane("pasientInfo")}
            >
              Om pasient
            </button>
            <button
              className={`${styles.fane} ${valgtFane === "pasientMed" ? styles.faneAktiv : ""}`}
              onClick={() => setValgtFane("pasientMed")}
            >
              Medikament
            </button>
            <button
              className={`${styles.fane} ${valgtFane === "pasientVak" ? styles.faneAktiv : ""}`}
              onClick={() => setValgtFane("pasientVak")}
            >
              Vaksiner
            </button>
          </div>

          <div className={styles.faneRadTo}> 
            <button
              className={`${styles.fane} ${valgtFane === "pasientDok" ? styles.faneAktiv : ""}`}
              onClick={() => setValgtFane("pasientDok")}
            >
              Journaldokumenter
            </button>
            <button
              className={`${styles.fane} ${valgtFane === "pasientHis" ? styles.faneAktiv : ""}`}
              onClick={() => setValgtFane("pasientHis")}
            >
              Besøkshistorikk
            </button>
          </div>
        </div>

        {/*Fane innholdet */}
        {/* Fødselsnr (fnr) må sendes som prop til hver underkomponent sånn at de
            kan hente riktige data fra backend når det er klart */}

        {valgtFane === "pasientInfo" && (
          <JournalOmPasient fnr={pasient.fnr} />
        )}

        {valgtFane === "pasientMed" && (
          <JournalMedikament fnr={pasient.fnr} />
        )}

        {valgtFane === "pasientVak" && (
          <JournalVaksiner fnr={pasient.fnr} />
        )}

        {valgtFane === "pasientDok" && (
          <JournalDokumenter fnr={pasient.fnr} />
        )}

        {valgtFane === "pasientHis" && (
          <JournalHistorikk fnr={pasient.fnr} />
        )}

      </div>
    </div>
  );
}

export default Journal;