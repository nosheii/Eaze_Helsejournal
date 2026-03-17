// Hjem.jsx
import { Mail, Calendar, NotebookPen, User, Pill, Info } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Hjem.module.css";

function Widget({ icon, title, description, onClick, filled = false }) {
    const [hovered, setHovered] = useState(false);
    const kortKlasse = `${styles.widget} ${hovered ? styles.widgetHover : ""}`;
    const ikonKlasse = `${styles.ikonSirkel} ${filled ? styles.ikonSirkelFilled : styles.ikonSirkelOutline}`;

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={kortKlasse}
        >
            <div className={ikonKlasse}>
                {icon}
            </div>
            <div>
                <div className={styles.widgetTittel}>{title}</div>
                <div className={styles.widgetBeskrivelse}>{description}</div>
            </div>
        </button>
    );
}

function Hjem({ rolle, brukerinfo }) {
    const navigate = useNavigate();

    const idag = new Date();
    const dagManed = idag.toLocaleDateString("nb-NO", { day: "numeric", month: "long" });
    const visningsnavn = brukerinfo?.navn ?? rolle;

    const legeWidgets = [
        { icon: <Mail size={36} strokeWidth={1.8} />, title: "Innboks", description: "Les nye meldinger", filled: false, path: "/innboks" },
        { icon: <Calendar size={36} strokeWidth={1.8} />, title: "Kalender", description: "Se kommende timer og påminnelser", filled: false, path: "/avtaler" },
        // Endret fra /journalsok til /journal — JournalSok ligger nå på /journal
        { icon: <NotebookPen size={36} strokeWidth={1.8} />, title: "Journal", description: "Se og les journaler", filled: false, path: "/journal" },
        { icon: <User size={36} strokeWidth={1.8} />, title: "Min info", description: "Se og oppdater informasjon", filled: true, path: "/profil" },
        { icon: <Pill size={36} strokeWidth={1.8} />, title: "Resept", description: "Se og bestill resepter", filled: false, path: "/resept" },
        { icon: <Info size={36} strokeWidth={1.8} />, title: "Informasjon", description: "Finn nyttig informasjon", filled: true, path: "/informasjon" },
    ];

    const pasientWidgets = [
        { icon: <Mail size={36} strokeWidth={1.8} />, title: "Innboks", description: "Les meldinger fra legen din", filled: false, path: "/innboks" },
        { icon: <Calendar size={36} strokeWidth={1.8} />, title: "Avtaler", description: "Se og bestill timer", filled: false, path: "/avtaler" },
        { icon: <NotebookPen size={36} strokeWidth={1.8} />, title: "Journal", description: "Se din egen journal", filled: false, path: `/journal/${brukerinfo?.fnr}` },
        { icon: <Pill size={36} strokeWidth={1.8} />, title: "Resept", description: "Se dine resepter", filled: false, path: "/resept" },
        { icon: <User size={36} strokeWidth={1.8} />, title: "Min profil", description: "Se og oppdater dine opplysninger", filled: true, path: "/profil" },
        { icon: <Info size={36} strokeWidth={1.8} />, title: "Informasjon", description: "Finn nyttig informasjon", filled: true, path: "/informasjon" },
    ];

    const widgets = rolle === "lege" ? legeWidgets : pasientWidgets;

    return (
        <div className={styles.side}>
            <div className={styles.innhold}>

                <div className={styles.venstreSeksjon}>
                    <h1 className={styles.hilsen}>Hei, {visningsnavn}!</h1>

                    <div className={styles.kort}>
                        <div className={styles.dato}>{dagManed}</div>
                        <div className={styles.datoLabel}>I dag</div>
                    </div>

                    {rolle === "lege" && brukerinfo?.mail && (
                        <div className={styles.kort}>
                            <span className={styles.kortTittel}>Din info</span>
                            <span>Ansatt-ID: {brukerinfo.ansattID}</span>
                            <span>{brukerinfo.mail}</span>
                        </div>
                    )}
                </div>

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