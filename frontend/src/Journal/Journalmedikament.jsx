//skjellet til medikament fanen

function JournalMedikament({ fnr }) {
    return (
        <div style={{ padding: "32px", background: "#ffffff", border: "1.5px solid #d0ecec", borderRadius: "14px" }}>
            <p style={{ color: "#8aabab", fontSize: "15px" }}>JournalMedikament — kommer snart (fnr: {fnr})</p>
        </div>
    );
}

export default JournalMedikament;