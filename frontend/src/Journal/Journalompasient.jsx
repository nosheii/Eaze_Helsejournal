import { useState, useEffect} from "react";
import styles from './Journalompasient.module.css'

function JournalOmPasient({ fnr }) {



    return (
        <div className={styles.side}>
            <div className={styles.kort}>
                <h2 className = {styles.tittel}><b>Om pasient:</b></h2>
                <ul>
                    <li>
                        Blod type AB+
                    </li>
                </ul>
            </div>
            <div className={styles.kort}>
                <h2 className={styles.tittel}><b>Kritisk info:</b></h2>
                <ul>
                    <li>
                        Allergisk mot medisin
                    </li>
                    <li>
                        Hjerte sykdom
                    </li>
                </ul>
            </div>
        </div>
    );

}


export default JournalOmPasient;