import { useState, useEffect } from 'react'
import styles from './Avtaler.module.css'
// NORA
// hjelpefunksjon for å hjelpe med å parse datoene som kommer fra backend, hvis de kommer i ulike formater
function parseDato(tidspunkt) {
    if (tidspunkt && tidspunkt.includes(".")) { // Hvis tidspunktet inneholder punktum, antar vi at det er i formatet "dd.mm.åååå"
        const [dag, maned, ar] = tidspunkt.split(".") //da splitter vi det opp i dag, måned og år ved å splitte på punktum
        return new Date(`${ar}-${maned}-${dag}`) //og så lager vi en Date-objekt i formatet "åååå-mm-dd" som er lettere å jobbe med i JavaScript
    }
    return new Date(tidspunkt)
}

function formaterDato(tidspunkt) { // denne funksjonen er for at det skal se bedre ut når datoene vises (og at de er på norsk da)
    const dato = parseDato(tidspunkt) // parse først for å være sikker på at det er Date objekt, uansett format fra backend
    const datoDel = dato.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" }) // så formaterrer datoen til norsk format, 1.juni.1996 elns
    const tidDel = dato.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }) //så er det bare formatering av klokkeslettet
    return `${datoDel}, kl. ${tidDel}` //også settes det sammen til en fin dato og tid som vises u UI
}

function AvtaleKort({ avtale, tidligere }) { //denne komponenten brukes til å rendre hvert enkelt avtalekort.
    const [visHel, setVisHel] = useState(false) //useState brukes her for å sjekke om kommentaren er for lang til å vises i forhåndsvisningnen eller ikke
    const kortKommentar = avtale.kommentar && avtale.kommentar.length > 120 // Dette er bare for å sjekke at kommenatren ikke er lengre enn 120 teng.
        ? avtale.kommentar.slice(0, 120) + "..."  //hvis den er lengre enn 120, slice den ned til 120 og legg til prikk prikk prikk på slutten for å vise at det er mer tekst der.
        : avtale.kommentar //men hvis kommentaren er kortere enn 120, vis hele

        // her kommer selve renderingen av avtale kortet
    return ( 
        <div className={`${styles.avtaleKort} ${tidligere ? styles.avtaleKortTidligere : ""}`}> 
            <div className={styles.avtaleHeader}>
                {/* pasientNavn vises for lege, legeNavn vises for pasient bruker || for å vise det som finnes */}
                <span className={styles.pasientNavn}>{avtale.pasientNavn || avtale.legeNavn}</span>
                <span className={`${styles.tidspunkt} ${tidligere ? styles.tidspunktTidligere : ""}`}>
                    {formaterDato(avtale.tidspunkt)}
                </span>
            </div>
            <div className={styles.fnr}>Fødselsnummer: {avtale.fnr}</div>
            {avtale.kommentar && (
                <>
                    <div className={styles.kommentar}>
                        {visHel ? avtale.kommentar : kortKommentar}
                    </div>
                    {avtale.kommentar.length > 120 && (
                        <button className={styles.kommentarKnapp} onClick={() => setVisHel(prev => !prev)}>
                            {visHel ? "Vis mindre" : "Vis mer"}
                        </button>
                    )}
                </>
            )}
        </div>
    )
}

function Avtaler({ rolle }) { //her er hovedkomponenten til hele avtaler siden, den har ansvar for å hente avtalene og dele dem opp
                    // i både kommende og tidligere, og også for å håndtere den "hvis alle" knappen nederst for tidlgiere avtaler
                    // rolle-propen bestemmer hvilken URL vi henter fra — lege eller pasient
    const [avtaler, setAvtaler] = useState([]) // usestate for å lagre avtalene som hentes fra backend, starter som en tom array før dataen kommer inn
    const [visAlle, setVisAlle] = useState(false) //usestate starter som fale for å vise at vi bare viser de 3 første tidlgiere avtalene

    useEffect(() => {
        const token = sessionStorage.getItem("token")
        // lege henter sine egne avtaler via /avtaler/mine (filtrert på ansattID i backend)
        // pasient henter sine egne avtaler via /avtaler/pasient (filtrert på fnr i backend)
        const url = rolle === "lege"
            ? "http://localhost:8000/avtaler/mine"
            : "http://localhost:8000/avtaler/pasient"

        fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => response.json()) //når vi får svar fra backend, så parse til json
        .then(data => setAvtaler(data.avtaler)) //avtaler settes i state sån at vi kan bruke de til å rendre avtale kortene
        .catch(error => console.error("Kunne ikke hente avtaler:", error)) //hvis det er en feil i kallet, så logg det i konsollen
    }, [rolle]) // rolle er en avhengighet her — hvis rollen endres, hent på nytt

    function toggleVisAlle() { //denne funksjonen håndterer klikket på "se alle" knappen nederst for tidligere avtaler
        setVisAlle(prev => !prev) //hvis knappen trykkes, så toggler den visAlle boleanen mellom true og false, enten vise alle eller bare 3
    }

    const now = new Date() //henter nåværende dato, for å kunne skille avtalene på kommende og tidligere
    const kommende = avtaler.filter(a => parseDato(a.tidspunkt) > now) //filtrerer avtalene etter det som er kommende, altså de som er > nåværende dato
    const tidligere = avtaler.filter(a => parseDato(a.tidspunkt) <= now) //filtrerer avtalene etter det som er tidligere, altså de som er <= nåværende dato
    const visibleTidligere = visAlle ? tidligere : tidligere.slice(0, 3) //når visalle er true, vis alle tidligere avtaler, hvis ikke, bare 3

    return (
        <div className={styles.side}>
            <h1 className={styles.tittel}>Mine avtaler</h1>

            <p className={styles.seksjonTittel}>Kommende avtaler</p>
            {kommende.length === 0
                ? <p className={styles.ingenAvtaler}>Ingen kommende avtaler</p>
                : kommende.map(avtale => (
                    <AvtaleKort key={avtale.avtaleID} avtale={avtale} tidligere={false} />
                ))
            }

            <hr className={styles.skillelinje} />

            <p className={styles.seksjonTittel}>Tidligere avtaler</p>
            {tidligere.length === 0
                ? <p className={styles.ingenAvtaler}>Ingen tidligere avtaler</p>
                : visibleTidligere.map(avtale => (
                    <AvtaleKort key={avtale.avtaleID} avtale={avtale} tidligere={true} />
                ))
            }

            {tidligere.length > 3 && (
                <button className={styles.seMerKnapp} onClick={toggleVisAlle}>
                    {visAlle ? "Se mindre ↑" : `Se alle ${tidligere.length} tidligere avtaler ↓`}
                </button>
            )}
        </div>
    )
}

export default Avtaler