// Hjem.jsx
import { Mail, Calendar, NotebookPen, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Hjem.module.css";

function Widget({ icon, title, description, onClick, filled = false, harUlest = false }) {
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
            <div className={styles.ikonWrapper}>
                <div className={ikonKlasse}>
                    {icon}
                </div>
                {harUlest && <span className={styles.ulestDot} />}
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
    const [harUlesteMeldinger, setHarUlesteMeldinger] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        fetch("http://localhost:8000/meldinger", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then((data) => {
                const harUlest = data.meldinger.some((m) => m.lest === 0);
                setHarUlesteMeldinger(harUlest);
            })
            .catch((feil) => console.error("Kunne ikke sjekke uleste:", feil));
    }, []);

    const idag = new Date();
    const dagManed = idag.toLocaleDateString("nb-NO", { day: "numeric", month: "long" });
    const visningsnavn = brukerinfo?.navn ?? rolle;

    const legeWidgets = [
        { icon: <Mail size={36} strokeWidth={1.8} />, title: "Innboks", description: "Les nye meldinger", filled: false, path: "/innboks", harUlest: harUlesteMeldinger },
        { icon: <Calendar size={36} strokeWidth={1.8} />, title: "Avtaler", description: "Se kommende timer og påminnelser", filled: false, path: "/avtaler" },
        { icon: <NotebookPen size={36} strokeWidth={1.8} />, title: "Journal", description: "Se og les journaler", filled: false, path: "/journal" },
        { icon: <Info size={36} strokeWidth={1.8} />, title: "Informasjon om prosjektet", description: "Finn nyttig informasjon", filled: true, path: "/informasjon" },
    ];

    const pasientWidgets = [
        { icon: <Mail size={36} strokeWidth={1.8} />, title: "Innboks", description: "Les meldinger fra legen din", filled: false, path: "/innboks", harUlest: harUlesteMeldinger },
        { icon: <Calendar size={36} strokeWidth={1.8} />, title: "Avtaler", description: "Se og bestill timer", filled: false, path: "/avtaler" },
        { icon: <NotebookPen size={36} strokeWidth={1.8} />, title: "Journal", description: "Se din egen journal", filled: false, path: `/journal/${brukerinfo?.fnr}` },
        { icon: <Info size={36} strokeWidth={1.8} />, title: "Informasjon om prosjektet", description: "Finn nyttig informasjon", filled: true, path: "/informasjon" },
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
                            harUlest={w.harUlest ?? false}
                            onClick={() => navigate(w.path)}
                        />
                    ))}
                </div>
            </div>
            <footer className={styles.footer}>
                <span className={styles.footerNavn}>Eaze</span>
                <span className={styles.footerTekst}>Et studentprosjekt ved USN</span>
                <span className={styles.footerAar}>© 2026</span>
            </footer>
        </div>
    );
}

export default Hjem;