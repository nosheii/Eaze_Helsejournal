import {useState, useEffect} from "react";
import "./Vaksine.css";

// henter pasientdata fra backend

export function Vaksine () {
    const [vaksineID, setVaksineID] = useState([])
    const[vaksineNavn, setVaksineNavn] = useState("")
    const [fnr, setFnr] = useState("21267788")
    const [dato, setDato] = useState("")

    useEffect(() => {
        // henter token fra localStorage for innlogging
        const token = localStorage.getItem("token")
        fetch(`/vaksine/${fnr}`, { // sendet GET-forespørsel til backend
            headers: {
                "Authorization": `Bearer ${token}` //innlogging
            }
        })
        .then(res => res.json())
        .then(data => {
            setVaksineID(data.vaksine) //Lagrer vaksiner i state
        })
    }, [fnr]) //starter på nytt hvis fnr endres

    return (
        <div className="vaksine">
            <h1>Vaksine</h1>
            {vaksineID.map(v => ( // gjennomgår vaksiner og viser navn og dato for hver vaksine
                <div key={v.vaksineID}>
                    <p>Vaksine: {v.vaksineNavn} {v.dato}</p>
         </div>          
    ))}
 </div>

)
}


export default Vaksine;