/* Aurora Krogstad - 261696 */
import { Link } from 'react-router-dom'
import { useState } from 'react'
import './Navbar.css'
import logo from './assets/logo-eaze.png'
import profilBilde from './assets/profil-bilde.jpg'

function Navbar({ brukerinfo, onLoggUt, rolle }) {
  const journalPath = rolle === 'lege' ? '/journal' : `/journal/${brukerinfo.fnr}`

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Eaze logo" className="navbar-logo" />
        <div className="navbar-links">
          <Link to="/hjem" className="navbar-link">Hjem</Link>
          <Link to="/innboks" className="navbar-link">Innboks</Link>
          <Link to="/avtaler" className="navbar-link">Avtaler</Link>
          <Link to={journalPath} className="navbar-link">Journal</Link>
          <Link to="/informasjon" className="navbar-link">Informasjon</Link>
        </div>
      </div>
      <div className="navbar-right">
        <span className="navbar-user-name">{brukerinfo.navn}</span>
        <img src={profilBilde} alt="Profil" className="navbar-profile-img" />
        <button className="navbar-loggut-btn" onClick={onLoggUt}>Logg ut</button>
      </div>
    </nav>
  )
}

export default Navbar