/* Aurora Krogstad - 261696 og Mumtaz A. Cade - 273783 */
// Her defineres navbar-komponenten som brukes gjennom hele applikasjonen. 
// Inkliuderer logo, navigasjonslenker, og brukerinfo med profilbilde og logg ut-knapp.
import { Link } from 'react-router-dom'
import { useState } from 'react'
import './Navbar.css'
import logo from './assets/logo-eaze.png'
import profilBilde from './assets/profil-bilde.jpg'

function Navbar({ brukerinfo, onLoggUt, rolle }) { // Brukerinfo, onLoggUt og rolle kommer som props fra token i App.jsx, og bestemmer hva som vises i navbaren basert på brukerrolle.
  const journalPath = rolle === 'lege' ? '/journal' : `/journal/${brukerinfo.fnr}`
// Her defineres journalPath basert på brukerrolle. Leger skal kunne se journalen til alle pasienter, mens pasienter skal kun se sin egen. 
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/hjem" className="navbar-link"><img src={logo} alt="Eaze logo" className="navbar-logo" /></Link>
        <div className="navbar-links">
          <Link to="/hjem" className="navbar-link">Hjem</Link>
          <Link to="/innboks" className="navbar-link">Innboks</Link>
          <Link to="/avtaler" className="navbar-link">Avtaler</Link>
          <Link to={journalPath} className="navbar-link">Journal</Link>
          <Link to="/informasjon" className="navbar-link">Informasjon</Link>
        </div>
      </div>
      <div className="navbar-right">
        <span className="navbar-user-name">{brukerinfo.navn}</span>  // Her vises navnet til den innloggede brukeren i navbaren, hentet fra brukerinfo.
        <img src={profilBilde} alt="Profil" className="navbar-profile-img" />
        <button className="navbar-loggut-btn" onClick={onLoggUt}>Logg ut</button>
      </div>
    </nav>
  )
}

export default Navbar