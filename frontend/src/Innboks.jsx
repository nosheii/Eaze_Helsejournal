//NORA AL-TAY
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

  // laster er en bolean som sier at den venter på data fra backend
  const [laster, setLaster] = useState(true);

  // visSvarSkjema er en boolean som styrer om svar-skjemaet vises eller ikke
  const [visSvarSkjema, setVisSvarSkjema] = useState(false);

  // svarTekst er staten som holder teksten brukeren skriver i svar-skjemaet
  const [svarTekst, setSvarTekst] = useState("");

  //boolean som styrer om den nytt meldingskjema skal vises eller ikke.
  //Stater som false sånn at det ikke vises før brukeren har trykket på knappen
  const [visNyMelding, setVisNyMelding] = useState(false);

  //useState for å holde søketeksten i søkefeltet for meldinger, starter som en tom streng
  const [sokeTekst, setSokeTekst] = useState("");

  //useState for å holde resultatene av søket, starter som en tom array]
  const [sokeResultater, setSokeResultater] = useState([]);

  //denne holder på den valgte mottakeren i ny meldingsskjema.
  //starter som null slik at ingen mottaker er valgt før brukeren velger en
  const [valgtMottaker, setValgtMottaker] = useState(null);

  // denne holder på den nye overskriften i ny meldingsskjema, starter som en tom streng
  const [nyOverskrift, setNyOverskrift] = useState("");

  // holder på det nye innholdet i meldingsskjema, starter som en tom streng
  const [nyInnhold, setNyInnhold] = useState("");

  // useEffect kjører koden inni seg en gang når komponenten er klar
  // tom array på slutten betyr "ingen avhengigheter", altså ingen variabler som skal triggere denne koden på nytt når de endres.
  // når komponenten er klar, gå inn i useeffect og hent meldingene fra backend
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    fetch("http://localhost:8000/meldinger", {
      headers: {
        // verify_token i FastAPI forventer tokenet i Authorization-headeren
        // på bavkend så bare sjekker den om det er riktig bruker med riktig token
        // også joiner den meldingene i databasen med brukernavn sånn at vi også får hvem som har sendt den
        // uten å sende nytt kall 
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setMeldinger(data.meldinger);

        // når vi først ser meldingene så viser den første melding i listen automatisk
        if (data.meldinger.length > 0) {
          setValgtId(data.meldinger[0].meldingID);
        }

        setLaster(false); // når dataen er hentet så skrurs av spinneren
      })
      .catch((feil) => {
        // hvis noe er feil i databasen(kallet ikke funker), så skrys av spinneren og vises feilmelding i konsollen
        console.error("Kunne ikke hente meldinger:", feil);
        setLaster(false);
      });
  }, []);

  // Nå skal det finnes valgt melding i listen
  // Dette oppdateres automatisk når bruker klikker på en melding
  // valgtId er det som finner fram riktig melding i listen
  const valgtMelding = meldinger.find((m) => m.meldingID === valgtId);

  // Denne funksjonen markerer en melding som lest når den blir klikket på
  // Den gjør det med å kalle PATCH endpointen i bavkend som oppdaterer feltet som lest i db
  function merkSomLest(meldingID) {
    const token = sessionStorage.getItem("token");

    fetch(`http://localhost:8000/meldinger/${meldingID}/lest`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(() => {
        // oppdaterer meldingen i useState sånn at den blir lest i UI uten å måtte hente listen på nytt
        setMeldinger((prev) =>
          prev.map((m) =>
            m.meldingID === meldingID ? { ...m, lest: 1 } : m
          )
        );
      })
      .catch((feil) => console.error("Kunne ikke merke som lest:", feil));
  }

  // Nå er det funksjonen som kjører når en melding blir klikket på i listen
  function velgMelding(melding) {
    setValgtId(melding.meldingID);
    setVisSvarSkjema(false); // lukk svarskjema når man bytter melding
    setSvarTekst("");
    // meldingen blir kun lest når den klikkes på, ikke når den bare vises i listen
    // så kjører funksjonen merkSomLest som oppdaterer både front og back
    if (melding.lest === 0) {
      merkSomLest(melding.meldingID);
    }
  }

  // sendSvar sender et svar til avsenderen av den valgte meldingen
  // mottakerID er avsenderID fra den valgte meldingen siden vi svarer tilbake
  // overskriften prefikses med "Re:" som er standard konvensjon for svar
  async function sendSvar() {
    const token = sessionStorage.getItem("token");

    const respons = await fetch("http://localhost:8000/meldinger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        mottakerID: valgtMelding.avsenderID,
        overskrift: `Re: ${valgtMelding.overskrift}`,
        innhold: svarTekst
      })
    });

    if (respons.ok) {
      // Skjul skjemaet og nullstill teksten etter sending
      setVisSvarSkjema(false);
      setSvarTekst("");
    }
  }

  // Denne funksjonen håndterer søk etter brukere når de vil sende ny melding
  async function søkEtterBruker(tekst) {
    setSokeTekst(tekst) // oppdaterer søketeskten i state sånn at den vises i søkefeltet
    if (tekst.length < 2) { //søketeksten må være minst 2 tegn for å gjøre søk.
      setSokeResultater([])
      return
    }
    const token = sessionStorage.getItem("token") //token for å autentisere kallet til backend
    const respons = await fetch(`http://localhost:8000/brukere/søk?navn=${tekst}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    const data = await respons.json()
    setSokeResultater(data.resultater) // oppdaterer søkeResultater i state med resultatene fra backend sånn at de kan vises i UI
  }

  // Denne funksjonen er veldig lik sendSvar, men bare at den sender en helt ny melding 
  // Til den valgte mottakeren i stedet for at avsender er den meldingen som er valgt fra før av.
  async function sendNyMelding() {
    const token = sessionStorage.getItem("token"); //verifiserer token for autentisering av kallet fra backend
    const respons = await fetch("http://localhost:8000/meldinger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        mottakerID: valgtMottaker.userID,
        overskrift: nyOverskrift,
        innhold: nyInnhold
      })
    });

    if (respons.ok) {
      // Hvis melding blir sendt, lukk skjema og nullstill alle state variabler vi brukte.
      // Dette er viktig for å tømme skjema og gjøre det klart for neste gang en bruker vil sende ny melding
      setVisNyMelding(false);
      setNyOverskrift("");
      setNyInnhold("");
      setValgtMottaker(null);
      setSokeTekst("");
      setSokeResultater([]);
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

        {/* VENSTRE: sidebar */}
        <aside className={styles.sidebar}>
          <button
            className={styles.nyMeldingKnapp}
            onClick={() => setVisNyMelding(true)}
          >
            <PenSquare size={18} strokeWidth={1.8} />
            Skriv ny melding
          </button>

          <div className={styles.meldingListe}>
            {laster && <div className={styles.laster}>Henter meldinger...</div>}
            {!laster && meldinger.length === 0 && (
              <div className={styles.ingenMeldinger}>Ingen meldinger</div>
            )}
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
                    {melding.lest === 0 && <span className={styles.ulestDot} />}
                  </div>
                  <span className={styles.kortOverskrift}>{melding.overskrift}</span>
                  <span className={styles.kortForhåndsvisning}>
                    {melding.innhold.slice(0, 60)}...
                  </span>
                  <span className={styles.kortDato}>{formaterDato(melding.sendt_dato)}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* HØYRE: meldingsvisning */}
        <main className={styles.meldingsVisning}>

          {/* Ny melding skjema */}
          {visNyMelding && (
            <div className={styles.nyMeldingSkjema}>
              <h3 className={styles.nyMeldingTittel}>Ny melding</h3>

              <div className={styles.nyMeldingFelt}>
                <label>Til</label>
                {valgtMottaker ? (
                  <div className={styles.mottakerChip}>
                    <span>{valgtMottaker.navn}</span>
                    <button onClick={() => {
                      setValgtMottaker(null);
                      setSokeTekst("");
                    }}>✕</button>
                  </div>
                ) : (
                  <div className={styles.søkeKontainer}>
                    <input
                      className={styles.nyMeldingInput}
                      placeholder="Søk etter navn..."
                      value={sokeTekst}
                      onChange={(e) => søkEtterBruker(e.target.value)}
                    />
                    {sokeResultater.length > 0 && (
                      <div className={styles.søkeDropdown}>
                        {sokeResultater.map((bruker) => (
                          <button
                            key={bruker.userID}
                            className={styles.søkeResultat}
                            onClick={() => {
                              setValgtMottaker(bruker);
                              setSokeResultater([]);
                              setSokeTekst("");
                            }}
                          >
                            {bruker.navn}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.nyMeldingFelt}>
                <label>Overskrift</label>
                <input
                  className={styles.nyMeldingInput}
                  placeholder="Skriv overskrift..."
                  value={nyOverskrift}
                  onChange={(e) => setNyOverskrift(e.target.value)}
                />
              </div>

              <div className={styles.nyMeldingFelt}>
                <label>Melding</label>
                <textarea
                  className={styles.nyMeldingTextarea}
                  placeholder="Skriv din melding her..."
                  value={nyInnhold}
                  onChange={(e) => setNyInnhold(e.target.value)}
                  rows={5}
                />
              </div>

              <div className={styles.svarKnapper}>
                <button
                  className={styles.sendKnapp}
                  onClick={sendNyMelding}
                  disabled={!valgtMottaker || nyOverskrift.trim() === "" || nyInnhold.trim() === ""}
                >
                  Send melding
                </button>
                <button
                  className={styles.avbrytKnapp}
                  onClick={() => setVisNyMelding(false)}
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}

          {/* Tomt state */}
          {!valgtMelding && !laster && !visNyMelding && (
            <div className={styles.tomtState}>
              <Inbox size={48} strokeWidth={1.2} />
              <p>Ingen melding valgt</p>
            </div>
          )}

          {/* Valgt melding */}
          {valgtMelding && !visNyMelding && (
            <>
              <div className={styles.meldingsHeader}>
                <h2 className={styles.meldingsOverskrift}>{valgtMelding.overskrift}</h2>
                <div className={styles.skillelinje} />
              </div>
              <p className={styles.meldingsInnhold}>{valgtMelding.innhold}</p>
              <div className={styles.meldingsBunn}>
                <div className={styles.avsenderInfo}>
                  <div className={styles.avsenderAvatar}>
                    {valgtMelding.avsender_navn.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className={styles.avsenderLabel}>Fra</div>
                    <div className={styles.avsenderNavn}>{valgtMelding.avsender_navn}</div>
                    <div className={styles.meldingsDato}>{formaterDato(valgtMelding.sendt_dato)}</div>
                  </div>
                </div>
                <button
                  className={styles.svarKnapp}
                  onClick={() => setVisSvarSkjema(true)}
                >
                  <Reply size={18} strokeWidth={1.8} />
                  Svar avsender
                </button>
              </div>

              {visSvarSkjema && (
                <div className={styles.svarSkjema}>
                  <p className={styles.svarTil}>Svar til: {valgtMelding.avsender_navn}</p>
                  <textarea
                    className={styles.svarTextarea}
                    placeholder="Skriv ditt svar her..."
                    value={svarTekst}
                    onChange={(e) => setSvarTekst(e.target.value)}
                    rows={5}
                  />
                  <div className={styles.svarKnapper}>
                    <button
                      className={styles.sendKnapp}
                      onClick={sendSvar}
                      disabled={svarTekst.trim() === ""}
                    >
                      Send svar
                    </button>
                    <button
                      className={styles.avbrytKnapp}
                      onClick={() => {
                        setVisSvarSkjema(false);
                        setSvarTekst("");
                      }}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
export default Innboks;