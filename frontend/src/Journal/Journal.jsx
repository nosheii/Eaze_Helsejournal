// Journal.jsx
// Hovedkomponenten for alle journal fanene.
// Denne skal ha ansvar for å vite hvilken fane er valgt og vise riktig innhold basert på onClick
// Logikken på de andre fanene er delt opp i underkomponenter for 
// å holde det mer ryddig og mindre kaotisk

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import styles from "./Journal.module.css";

// Her importeres underkomponentene for hver fane.
import JournalOmPasient from "./JournalOmPasient";
import JournalMedikament from "./JournalMedikament";
import JournalVaksiner from "./JournalVaksiner";
import JournalDokumenter from "./JournalDokumenter";
import JournalHistorikk from "./Journalhistorikk";

function Journal({ rolle }) {
  const [valgtFaneParams, setValgtFane] = useSearchParams();
  const valgtFane = valgtFaneParams.get("fane") || "pasientInfo"; // Hent "fane" fra URL-en, default til "pasientInfo" hvis ikke satt

  // useParams henter fnr fra URL-en, f.eks. /journal/21267788 → fnr = "21267788"
  const { fnr } = useParams();

  // useState for å lagre pasientdata fra backend
  const [pasient, setPasient] = useState(null);
  const [laster, setLaster] = useState(true);
  // useState for å lagre journalnummeret som skal sendes til JournalDokumenter
  const [journalNr, setJournalNr] = useState(null);

  // useEffect henter pasientinfo fra backend når komponenten lastes inn
  // eller når fnr i URL-en endrer seg (derfor har vi [fnr] i dependency-arrayen)
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    fetch(`http://127.0.0.1:8000/journal/${fnr}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Journal data:", data);
        if (data.journaler && data.journaler.length > 0 && data.journaler[0].forNavn !== null) {
          const j = data.journaler[0];
          setJournalNr(j.journalNr);
          setPasient({
            fnr: j.fnr,
            navn: `${j.etterNavn}, ${j.forNavn}`,
            detaljer: j.fnr
          });
        }
        // Oppretter ikke journal automatisk lenger
        // JournalSok passer heller på å sjekke at pasienten fatkisk finnes
        setLaster(false);
      })
  }, [fnr]); // [fnr] betyr: kjør på nytt hvis fnr i URL-en endrer seg


  return (
    <div className={styles.side}>
      <div className={styles.innhold}>

        {/* Pasientheader — viser navn og fnr mens vi venter på mer detaljert info */}
        <div className={styles.pasientHeader}>
          {laster ? (
            <span className={styles.pasientNavn}>Laster pasient...</span>
          ) : pasient ? (
            <>
              <span className={styles.pasientNavn}>{pasient.navn}</span>
              <span className={styles.pasientDetaljer}> – {pasient.detaljer}</span>
            </>
          ) : (
            <span className={styles.pasientNavn}>Pasient ikke funnet</span>
          )}
        </div>

        {/* De ulike fanene */}
        <div className={styles.faneKontainer}>
          <div className={styles.faneRad}>
            <button
              className={`${styles.fane} ${valgtFane === "pasientInfo" ? styles.faneAktiv : ""}`}
              onClick={() => setValgtFane({ fane: "pasientInfo" })}
            >
              Om pasient
            </button>
            <button
              className={`${styles.fane} ${valgtFane === "pasientMed" ? styles.faneAktiv : ""}`}
              onClick={() => setValgtFane({ "fane": "pasientMed" })}
            >
              Medikament
            </button>
            <button
              className={`${styles.fane} ${valgtFane === "pasientVak" ? styles.faneAktiv : ""}`}
              onClick={() => setValgtFane({ "fane": "pasientVak" })}
            >
              Vaksiner
            </button>
          </div>

          <div className={styles.faneRadTo}>
            <button
              className={`${styles.fane} ${valgtFane === "pasientDok" ? styles.faneAktiv : ""}`}
              onClick={() => setValgtFane({ "fane": "pasientDok" })}
            >
              Journaldokumenter
            </button>
            <button
              className={`${styles.fane} ${valgtFane === "pasientHis" ? styles.faneAktiv : ""}`}
              onClick={() => setValgtFane({ "fane": "pasientHis" })}
            >
              Besøkshistorikk
            </button>
          </div>
        </div>

        {/* Fane-innhold */}
        {/* fnr sendes som prop til hver underkomponent slik at de
            kan hente riktige data fra backend */}

        {valgtFane === "pasientInfo" && (
          <JournalOmPasient fnr={fnr} />
        )}

        {valgtFane === "pasientMed" && (
          <JournalMedikament fnr={fnr} rolle={rolle} />
        )}

        {valgtFane === "pasientVak" && (
          <JournalVaksiner fnr={fnr} rolle={rolle} />
        )}

        {valgtFane === "pasientDok" && (
          <JournalDokumenter journalNr={journalNr} />
        )}

        {valgtFane === "pasientHis" && (
          <JournalHistorikk fnr={fnr} rolle={rolle} />
        )}

      </div>
    </div>
  );
}

export default Journal;