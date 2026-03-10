// Innboks.jsx
// Denne komponenten henter meldinger fra backend og viser dem i en to-kolonne-layout.
// Venstre side er en liste over meldinger, høyre side viser den valgte meldingen.

// bruker useState og useEffect fra React for å håndtere state og sideeffekter
// useState = huske verdier mellom re-renders altså når noe oppdateres på siden (f.eks. når vi får data fra backend)
// useEffect = gjøre noe én gang når komponenten lastes inn som å hente fra bavkend
import { useState, useEffect } from "react";
import { Reply, PenSquare, Inbox } from "lucide-react";
import styles from "./Innboks.module.css";

function Innboks() {
  // meldinger starter som en tom liste, men den vil fylles inn etterhvert når vi får data fra backend
  const [meldinger, setMeldinger] = useState([]);

  // valgtId betyr hvilken melding som er valgt i listen for øyeblikket (den som vises akk nå)
  // det at den er null i starten betyr bare ingen melding valgt ennå (mens siden loader)
  const [valgtId, setValgtId] = useState(null);

  // laster er en bolean som sier at den venter på data fr a backend
  const [laster, setLaster] = useState(true);

  // useEffect kjører koden inni seg en gang når komponenten er klar
  // tom array på slutten betyr "ingen avhengigheter", altså ingen variabler som skal triggere denne koden på nytt når de endres.
  // når komponenten er klar, gå inn i useeffect og hent melidgnene fra backend
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    fetch("http://localhost:8000/meldinger", {
      headers: {
        // verify_token i FastAPI forventer tokenet i Authorization-headeren
        // på bavkend så bare sjekker den om det er riktig bruker med riktig token
        // også joiner den meldingene i databasen med brukernavn sånn at vi også får hvem som har sendt den
        //uten å sende nytt kall 
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json()) //så gjør vi om dataen til JSON så den er lettere å jobbe emd
      .then((data) => { 
        setMeldinger(data.meldinger);

        // når vi først ser meldingene så viser den første melding i listen automatisk
        if (data.meldinger.length > 0) {
          setValgtId(data.meldinger[0].meldingID);
        }

        setLaster(false); // når dataen er hentent så skrus av den spinneren
      })
      .catch((feil) => {
        //hvis noe er feil i databasen(kallet ikke funker), så skryr av spinneren og viser feilmelding i konsollen
        console.error("Kunne ikke hente meldinger:", feil);
        setLaster(false);
      });
  }, []);

  //Nå skal det finnes valgt melding i listen
  //Dette oppdateres automatisk når bruker klikker på en melding
  // valgtId er det som finner fram riktig melding i listen
  const valgtMelding = meldinger.find((m) => m.meldingID === valgtId);

  // Denne funksjonen markerer en melding som lest når den blir klikket på
  //Den gjør det med å kalle PATHCH endpointen i bavkend som oppdaterer feltet som lest i db
  function merkSomLest(meldingID) {
    const token = sessionStorage.getItem("token");

    fetch(`http://localhost:8000/meldinger/${meldingID}/lest`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` } //sjekker at det er riktig bruker fortsatt ! sikkerhet er viktig
    })
      .then(() => {
        // oppdaterer meldingen i useState sånn at den blir lest i UI uten å måtte hente listen på nytt
        setMeldinger((prev) => //finner riktig melding i listen 
          prev.map((m) => // prev.map prøver å finne riktig melding (m) i listen ved å sjekke om m.meldingID er lik meldingID som vi sendte inn i funksjonen
            m.meldingID === meldingID ? { ...m, lest: 1 } : m //så oppdaterer den feltet lest til 1 (lest) ellers så lar den meldingen være som den er
          )
        );
      })
      .catch((feil) => console.error("Kunne ikke merke som lest:", feil)); //tilfelle noe går galt i kallet
  }

  //Nå er det funksjonen som kjører når en melding blir klikket på i listen
  function velgMelding(melding) {
    setValgtId(melding.meldingID);
    // meldingen blir kun lest når den klikkes på, ikke når den bare vises i listen
    //  så kjører funksjonen merkSomLest som oppdaterer både front og back
    if (melding.lest === 0) {
      merkSomLest(melding.meldingID);
    }
  }

  // denne er for å formatere dato fra backend til lesbar norsk stil
  // backend returnerer en ISO-streng som ser ut som "2024-06-01T12:34:56, og denne funksjonen gjør den om til "1. juni 2024, 12:34"
  function formaterDato(datoStreng) {
    const dato = new Date(datoStreng);
    return dato.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return (
    <div className={styles.side}>
      <div className={styles.layout}>

        {/* VENSTRE: tiny sidebar */}
        <aside className={styles.sidebar}>
          <button className={styles.nyMeldingKnapp}>
            <PenSquare size={18} strokeWidth={1.8} />
            Skriv ny melding
          </button>

          <div className={styles.meldingListe}>
            {/* Spinneren som laster og venter på backend */}
            {laster && (
              <div className={styles.laster}>Henter meldinger...</div>
            )}

            {/* Viser tom-melding hvis listen er tom etter lasting */}
            {!laster && meldinger.length === 0 && (
              <div className={styles.ingenMeldinger}>Ingen meldinger</div>
            )}

            {/* Render ett kort per melding i listen */}
            {meldinger.map((melding) => {
              const erValgt = melding.meldingID === valgtId;
              const kortKlasse = `${styles.meldingKort} ${erValgt ? styles.meldingKortAktiv : ""}`;

              return (
                <button
                  key={melding.meldingID}
                  className={kortKlasse}
                  onClick={() => velgMelding(melding)}
                >
                  <div className={styles.kortTopp}>
                    <span className={styles.kortAvsender}>{melding.avsender_navn}</span>
                    {/* Vis blå-prikk kun hvis meldingen er ulest (lest === 0) */}
                    {melding.lest === 0 && <span className={styles.ulestDot} />}
                  </div>
                  <span className={styles.kortOverskrift}>{melding.overskrift}</span>
                  <span className={styles.kortForhåndsvisning}>
                    {/* Vis kun de første 60 tegnene som forhåndsvisning så det ikke blir for langt */}
                    {melding.innhold.slice(0, 60)}...
                  </span>
                  <span className={styles.kortDato}>{formaterDato(melding.sendt_dato)}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* HØYRE: større meldingsvisning*/}
        <main className={styles.meldingsVisning}>
          {/* Vis tomt state hvis ingenting er valgt ennå */}
          {!valgtMelding && !laster && (
            <div className={styles.tomtState}>
              <Inbox size={48} strokeWidth={1.2} />
              <p>Ingen melding valgt</p>
            </div>
          )}

          {/* Vis den valgte meldingen når den er valgt */}
          {valgtMelding && (
            <>
              <div className={styles.meldingsHeader}>
                <h2 className={styles.meldingsOverskrift}>{valgtMelding.overskrift}</h2>
                <div className={styles.skillelinje} />
              </div>

              {/* white-space: pre-line i CSS gjør at \n rendres som linjeskift */}
              <p className={styles.meldingsInnhold}>{valgtMelding.innhold}</p>

              <div className={styles.meldingsBunn}>
                <div className={styles.avsenderInfo}>
                  <div className={styles.avsenderAvatar}>
                    {/* Forkort initialene til to bokstaver*/}
                    {valgtMelding.avsender_navn.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className={styles.avsenderLabel}>Fra</div>
                    <div className={styles.avsenderNavn}>{valgtMelding.avsender_navn}</div> 
                    <div className={styles.meldingsDato}>{formaterDato(valgtMelding.sendt_dato)}</div> {/* Vis dato under navnet */}
                  </div>
                </div>

                <button className={styles.svarKnapp}>
                  <Reply size={18} strokeWidth={1.8} />
                  Svar avsender {/* Vis "Svar avsender" på større skjermer, og bare "Svar" på mindre skjermer for å spare plass */}
                  {/*her må vi bygge på litt ekstra funksjonalitet for å faktisk kunne svare på meldinger !!!!!! */}
                </button>
              </div>
            </>
          )}
        </main>

      </div>
    </div>
  );
}

export default Innboks;