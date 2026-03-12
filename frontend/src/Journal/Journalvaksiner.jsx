import { useState, useEffect } from "react";

function JournalVaksiner({ fnr }) {
    const [vaksine, setVaksine] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!fnr) return;
        fetch(`http://localhost:8000/vaksine/${fnr}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            setVaksine(data.vaksine);
        });

    }, [fnr]);

    return (
        // Placeholder for vaksinehistorikk, kommer snart
        <div style={{ padding: "32px", background: "#ffffff", border: "1.5px solid #d0ecec", borderRadius: "14px" }}>
            <p style={{ color: "#8aabab", fontSize: "15px" }}>JournalVaksiner — kommer snart (fnr: {fnr})</p>
        </div>
    );
}

export default JournalVaksiner;
