//NORA AL-TAY
// Innboks.jsx
// Denne komponenten henter meldinger fra backend og viser dem i en to-kolonne-layout.
// Venstre side er en liste over meldinger, høyre side viser den valgte meldingen.

// bruker useState og useEffect fra React for å håndtere state og sideeffekter
// useState = huske verdier mellom re-renders altså når noe oppdateres på siden (f.eks. naar noe oppdateres pa siden)
// useEffect = gjore noe en gang nar komponenten lastes inn som a hente fra backend
import { useState, useEffect } from "react";
import { Reply, PenSquare, Inbox, MailOpen, SendHorizonal } from "lucide-react";
import styles from "./Innboks.module.css";

// rolle-propen brukes til a bestemme hvilket sokeendepunkt vi skal bruke
// lege soker etter pasienter via /brukere/sok, pasient henter sine leger via /brukere/mine-leger
function Innboks({ rolle }) {
  // meldinger starter som en tom liste, men den vil fylles inn etterhvert nar vi far data fra backend
  const [meldinger, setMeldinger] = useState([]);

  // valgtId betyr hvilken melding som er valgt i listen for oyeblikket (den som vises akk na)
  // det at den er null i starten betyr bare ingen melding valgt enna (mens siden loader)
  const [valgtId, setValgtId] = useState(null);

  // laster er en bolean som sier at den venter pa data fra backend
  const [laster, setLaster] = useState(true);

  // visSvarSkjema er en boolean som styrer om svar-skjemaet vises eller ikke
  const [visSvarSkjema, setVisSvarSkjema] = useState(false);

  // svarTekst er staten som holder teksten brukeren skriver i svar-skjemaet
  const [svarTekst, setSvarTekst] = useState("");

  //boolean som styrer om den nytt meldingskjema skal vises eller ikke.
  //Stater som false sann at det ikke vises for brukeren har trykket pa knappen
  const [visNyMelding, setVisNyMelding] = useState(false);

  //useState for a holde soketeksten i sokefeltet for meldinger, starter som en tom streng
  const [sokeTekst, setSokeTekst] = useState("");

  //useState for a holde resultatene av soket, starter som en tom array
  const [sokeResultater, setSokeResultater] = useState([]);

  //denne holder pa den valgte mottakeren i ny meldingsskjema.
  //starter som null slik at ingen mottaker er valgt for brukeren velger en
  const [valgtMottaker, setValgtMottaker] = useState(null);

  // denne holder pa den nye overskriften i ny meldingsskjema, starter som en tom streng
  const [nyOverskrift, setNyOverskrift] = useState("");

  // holder pa det nye innholdet i meldingsskjema, starter som en tom streng
  const [nyInnhold, setNyInnhold] = useState("");

  // Denne styrer om utboks skal vises eller ikke, akkurat som visNyMelding og visSvarSkjema,
  // starter som false sann at den ikke vises for brukeren klikker pa utboks-knappen
  const [visUtboks, setVisUtboks] = useState(false);

  // useEffect kjorer koden inni seg en gang nar komponenten er klar
  // visUtboks er lagt til i dependency-arrayen sann at useEffect kjorer pa nytt nar vi bytter mellom innboks og utboks
  // nar komponenten er klar, ga inn i useeffect og hent meldingene fra backend
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    // velg riktig URL basert pa om vi viser utboks eller innboks
    const url = visUtboks
      ? "http://localhost:8000/meldinger/sendt"
      : "http://localhost:8000/meldinger"

    fetch(url, {
      headers: {
        // verify_token i FastAPI forventer tokenet i Authorization-headeren
        // pa backend sa bare sjekker den om det er riktig bruker med riktig token
        // ogsa joiner den meldingene i databasen med brukernavn sann at vi ogsa far hvem som har sendt den
        // uten a sende nytt kall
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setMeldinger(data.meldinger);

        // nar vi forst ser meldingene sa viser den forste melding i listen automatisk
        if (data.meldinger.length > 0) {
          setValgtId(data.meldinger[0].meldingID);
        }

        setLaster(false); // nar dataen er hentet sa skrurs av spinneren
      })
      .catch((feil) => {
        // hvis noe er feil i databasen(kallet ikke funker), sa skrys av spinneren og vises feilmelding i konsollen
        console.error("Kunne ikke hente meldinger:", feil);
        setLaster(false);
      });
  }, [visUtboks]); // kjor pa nytt nar visUtboks endrer seg

  // Na skal det finnes valgt melding i listen
  // Dette oppdateres automatisk nar bruker klikker pa en melding
  // valgtId er det som finner fram riktig melding i listen
  const valgtMelding = meldinger.find((m) => m.meldingID === valgtId);

  // Denne funksjonen markerer en melding som lest nar den blir klikket pa
  // Den gjor det med a kalle PATCH endpointen i backend som oppdaterer feltet som lest i db
  function merkSomLest(meldingID) {
    const token = sessionStorage.getItem("token");

    fetch(`http://localhost:8000/meldinger/${meldingID}/lest`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(() => {
        // oppdaterer meldingen i useState sann at den blir lest i UI uten a matte hente listen pa nytt
        setMeldinger((prev) =>
          prev.map((m) =>
            m.meldingID === meldingID ? { ...m, lest: 1 } : m
          )
        );
      })
      .catch((feil) => console.error("Kunne ikke merke som lest:", feil));
  }

  // Na er det funksjonen som kjorer nar en melding blir klikket pa i listen
  function velgMelding(melding) {
    setValgtId(melding.meldingID);
    setVisSvarSkjema(false); // lukk svarskjema nar man bytter melding
    setSvarTekst("");
    // meldingen blir kun lest nar den klikkes pa, ikke nar den bare vises i listen
    // sa kjorer funksjonen merkSomLest som oppdaterer bade front og back
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

  // Denne funksjonen handterer sok etter brukere nar legen vil sende ny melding
  // pasienter bruker ikke denne funksjonen siden de henter legene sine direkte via hentMineLeger
  async function sokEtterBruker(tekst) {
    setSokeTekst(tekst) // oppdaterer soketeksten i state sann at den vises i sokefeltet
    if (tekst.length < 2) { // soketeksten ma vare minst 2 tegn for a gjore sok
      setSokeResultater([])
      return
    }
    const token = sessionStorage.getItem("token") // token for a autentisere kallet til backend
    const respons = await fetch(`http://localhost:8000/brukere/sok?navn=${tekst}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    const data = await respons.json()
    setSokeResultater(data.resultater) // oppdaterer sokeResultater i state med resultatene fra backend sann at de kan vises i UI
  }

  // Denne funksjonen henter pasientens leger fra backend nar ny melding skjemaet apnes
  // den kalles kun for pasienter siden de ikke kan soke fritt blant alle brukere
  // pasienter kan bare sende meldinger til leger de har hatt avtaler med
  async function hentMineLeger() {
    const token = sessionStorage.getItem("token") // token for a autentisere kallet til backend
    const respons = await fetch("http://localhost:8000/brukere/mine-leger", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    const data = await respons.json()
    setSokeResultater(data.resultater) // bruker samme sokeResultater state for a vise legene i dropdown
  }

  // Denne funksjonen er veldig lik sendSvar, men bare at den sender en helt ny melding
  // Til den valgte mottakeren i stedet for at avsender er den meldingen som er valgt fra for av.
  async function sendNyMelding() {
    const token = sessionStorage.getItem("token"); // verifiserer token for autentisering av kallet fra backend
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
      // Dette er viktig for a tomme skjema og gjore det klart for neste gang en bruker vil sende ny melding
      setVisNyMelding(false);
      setNyOverskrift("");
      setNyInnhold("");
      setValgtMottaker(null);
      setSokeTekst("");
      setSokeResultater([]);
    }
  }

  // denne er for a formatere dato fra backend til lesbar norsk stil
  // backend returnerer en ISO-streng som ser ut som "2024-06-01T12:34:56, og denne funksjonen gjor den om til "1. juni 2024, 12:34"
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

        <aside className={styles.sidebar}>
          {/* nar knappen klikkes, apne ny melding skjema */}
          {/* for pasienter henter vi legene deres med en gang skjemaet apnes siden de ikke kan soke selv */}
          <button
            className={styles.nyMeldingKnapp}
            onClick={() => {
              setVisNyMelding(true);
              if (rolle === "pasient") hentMineLeger();
            }}
          >
            <PenSquare size={18} strokeWidth={1.8} />
            Skriv ny melding
          </button>

          {/* Innboks og utboks toggle-knapper */}
          {/* setValgtId(null) nullstiller valgt melding nar vi bytter mellom innboks og utboks */}
          {/* uten dette vil React prove a vise den forrige meldingen med feil feltnavn og krasje */}
          <div className={styles.utOginnBoks}>
            <button
              className={styles.innboksKnapp}
              onClick={() => { setVisUtboks(false); setValgtId(null); }}
            >
              <Inbox size={20} strokeWidth={1.3} />
              Innboks
            </button>
            <button
              className={styles.utboksKnapp}
              onClick={() => { setVisUtboks(true); setValgtId(null); }}
            >
              <SendHorizonal size={20} strokeWidth={1.3} />
              Utboks
            </button>
          </div>

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
                    {/* I utboksen viser vi hvem meldingen ble sendt til, i innboksen hvem som sendte den */}
                    <span className={styles.kortAvsender}>
                      {visUtboks ? melding.mottaker_navn : melding.avsender_navn}
                    </span>
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

        <main className={styles.meldingsVisning}>

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
                      {/* hvis pasient, vis legene igjen etter at chip fjernes sann at de kan velge pa nytt */ }
                      if (rolle === "pasient") hentMineLeger();
                    }}>x</button>
                  </div>
                ) : (
                  <div className={styles.sokeKontainer}>
                    {/* sokefeltet vises kun for leger siden pasienter henter legene sine direkte */}
                    {/* pasienter ser bare en dropdown med sine leger nar skjemaet apnes */}
                    {rolle !== "pasient" && (
                      <input
                        className={styles.nyMeldingInput}
                        placeholder="Sok etter navn..."
                        value={sokeTekst}
                        onChange={(e) => sokEtterBruker(e.target.value)}
                      />
                    )}
                    {/* dropdown med sokeresultater vises for bade lege og pasient */}
                    {sokeResultater.length > 0 && (
                      <div className={styles.sokeDropdown}>
                        {sokeResultater.map((bruker) => (
                          <button
                            key={bruker.userID}
                            className={styles.sokeResultat}
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

          {!valgtMelding && !laster && !visNyMelding && (
            <div className={styles.tomtState}>
              <Inbox size={48} strokeWidth={1.2} />
              <p>Ingen melding valgt</p>
            </div>
          )}

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
                    {/* Vis initialer basert pa om vi er i innboks eller utboks */}
                    {visUtboks
                      ? valgtMelding.mottaker_navn.split(" ").map((n) => n[0]).join("")
                      : valgtMelding.avsender_navn.split(" ").map((n) => n[0]).join("")
                    }
                  </div>
                  <div>
                    {/* I utboksen viser vi "Til" i stedet for "Fra" */}
                    <div className={styles.avsenderLabel}>{visUtboks ? "Til" : "Fra"}</div>
                    <div className={styles.avsenderNavn}>
                      {visUtboks ? valgtMelding.mottaker_navn : valgtMelding.avsender_navn}
                    </div>
                    <div className={styles.meldingsDato}>{formaterDato(valgtMelding.sendt_dato)}</div>
                  </div>
                </div>
                {/* Svar-knappen vises kun i innboksen, ikke i utboksen */}
                {!visUtboks && (
                  <button
                    className={styles.svarKnapp}
                    onClick={() => setVisSvarSkjema(true)}
                  >
                    <Reply size={18} strokeWidth={1.8} />
                    Svar avsender
                  </button>
                )}
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