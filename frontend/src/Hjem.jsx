// Hjem.jsx
import { Mail, Calendar, NotebookPen, User, Pill, Info } from "lucide-react"; //importerer ikoner fra lucide-react
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Hjem.module.css";

// Selve widgetsene på hovedsiden
function Widget({ icon, title, description, onClick, filled = false }) {
    const [hovered, setHovered] = useState(false);
    // Klassenavnene for de ulike widget tilstandene (vanlig, hover, fyll) settes dynamisk basert på props og state
    const kortKlasse = `${styles.widget} ${hovered ? styles.widgetHover : ""}`;
    const ikonKlasse = `${styles.ikonSirkel} ${filled ? styles.ikonSirkelFilled : styles.ikonSirkelOutline}`;

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={kortKlasse}
        >
            {/* Ikonsirkelelene  */}
            <div className={ikonKlasse}> {/* Ikonet selv blir barn av en div som er selve sirkelen, og ikonet arver fargen fra denne div'en */}
                {icon}
            </div>
            <div>
                <div className={styles.widgetTittel}>{title}</div>
                <div className={styles.widgetBeskrivelse}>{description}</div>
            </div>
        </button>
    );
}

//Hovedsiden som viser de forksjellige widgetsene basert på rollen som er innlogget
function Hjem({ rolle, brukerinfo }) {
    const navigate = useNavigate(); // useNavigate er det som lar oss navigere til forksjellige routere når vi klikker på widgetsene

    const idag = new Date(); // Henter dagens dato for å vise på hovedsiden
    const dagManed = idag.toLocaleDateString("nb-NO", { day: "numeric", month: "long" }); // Formaterer dagens dato som "15. september" på norsk
    const visningsnavn = brukerinfo?.navn ?? rolle; //hvis brukerinfo har navn, bruk det, hvis det ikke er navn, bruk rolle

    // små forskjeller i pasient vs lege widgets, begge to er definert seperat og har egne arrays.
    const legeWidgets = [ //Her blir widgetsene definert, og hvilke som skal være filled vs ikke. Legg også merke til at logoene er hentet fra lucide-react og at onClick navigerer til riktig path
        { icon: <Mail size={36} strokeWidth={1.8} />, title: "Innboks", description: "Les nye meldinger", filled: false, path: "/innboks" },
        { icon: <Calendar size={36} strokeWidth={1.8} />, title: "Kalender", description: "Se kommende timer og påminnelser", filled: false, path: "/avtaler" },
        { icon: <NotebookPen size={36} strokeWidth={1.8} />, title: "Journal", description: "Se og les journaler", filled: false, path: "/journal" },
        { icon: <User size={36} strokeWidth={1.8} />, title: "Min info", description: "Se og oppdater informasjon", filled: true, path: "/profil" },
        { icon: <Pill size={36} strokeWidth={1.8} />, title: "Resept", description: "Se og bestill resepter", filled: false, path: "/resept" },
        { icon: <Info size={36} strokeWidth={1.8} />, title: "Informasjon", description: "Finn nyttig informasjon", filled: true, path: "/informasjon" },
    ];

    const pasientWidgets = [
        { icon: <Mail size={36} strokeWidth={1.8} />, title: "Innboks", description: "Les meldinger fra legen din", filled: false, path: "/innboks" },
        { icon: <Calendar size={36} strokeWidth={1.8} />, title: "Avtaler", description: "Se og bestill timer", filled: false, path: "/avtaler" },
        { icon: <NotebookPen size={36} strokeWidth={1.8} />, title: "Journal", description: "Se din egen journal", filled: false, path: "/journal" },
        { icon: <Pill size={36} strokeWidth={1.8} />, title: "Resept", description: "Se dine resepter", filled: false, path: "/resept" },
        { icon: <User size={36} strokeWidth={1.8} />, title: "Min profil", description: "Se og oppdater dine opplysninger", filled: true, path: "/profil" },
        { icon: <Info size={36} strokeWidth={1.8} />, title: "Informasjon", description: "Finn nyttig informasjon", filled: true, path: "/informasjon" },
    ];

    const widgets = rolle === "lege" ? legeWidgets : pasientWidgets; //her bestemmes det hvilken wigets som vises basert på rolle 

    return (
        <div className={styles.side}>
            <div className={styles.innhold}>

                {/* Hilsen og onnlogging for brukere */}
                <div className={styles.venstreSeksjon}>
                    <h1 className={styles.hilsen}>Hei, {visningsnavn}!</h1>

                    <div className={styles.kort}>
                        <div className={styles.dato}>{dagManed}</div>
                        <div className={styles.datoLabel}>I dag</div>
                    </div>

                    {rolle === "lege" && brukerinfo?.mail && (
                        <div className={styles.kort}>
                            <span className={styles.kortTittel}>Din info</span> {/* viser ansatt id og mail for leger, hvis info er gyldig i token */}
                            <span>Ansatt-ID: {brukerinfo.ansattID}</span>
                            <span>{brukerinfo.mail}</span>
                        </div>
                    )}
                </div>

                {/* Dette er wigdet gridet som viser selve wigdetsene*/}
                {/* onClick er viktig for hver widget, hvis de klikkes på, naviger til riktig path tilsier den*/}
                <div className={styles.widgetGrid}>
                    {widgets.map((w) => (
                        <Widget
                            key={w.title}
                            icon={w.icon}
                            title={w.title}
                            description={w.description}
                            filled={w.filled}
                            onClick={() => navigate(w.path)}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}

export default Hjem;