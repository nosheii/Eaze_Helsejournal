import { useState } from 'react'
import { useNavigation } from 'react-router-dom'
import style from './Journaldokumenter.module.css'

function JournalDokumenter({ fnr }) {
    


    return (
        <div style={{ padding: "32px", background: "#ffffff", border: "1.5px solid #d0ecec", borderRadius: "14px" }}>
            <p style={{ color: "#8aabab", fontSize: "15px" }}>JournalDokumenter — kommer snart (fnr: {fnr})</p>
        </div>
    );
}

export default JournalDokumenter;