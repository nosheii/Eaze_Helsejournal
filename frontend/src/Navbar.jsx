import { Link } from 'react-router-dom'
import { useState } from 'react'
import './Navbar.css'
import logo from './assets/logo-eaze.png'
import profilBilde from './assets/profil-bilde.jpg'

function Navbar({ brukerinfo, onLoggUt, rolle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

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
        <div className="navbar-profile-wrapper">
          <img
            src={profilBilde}
            alt="Profil"
            className="navbar-profile-img"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="navbar-dropdown">
              <Link to="/min-info" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Min info</Link>
              <Link to="/rediger-info" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Rediger info</Link>
              <button className="dropdown-item dropdown-loggut" onClick={onLoggUt}>Logg ut</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar