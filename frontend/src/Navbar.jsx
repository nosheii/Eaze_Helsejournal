import { Link } from 'react-router-dom'
import './Navbar.css'
import logo from './assets/logo-eaze.png'
import profilBilde from './assets/profil-bilde.jpg'

function Navbar({ brukerinfo, onLoggUt }) {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src={logo} alt="Eaze logo" className="navbar-logo" />
                
                <div className="navbar-links">
                    <Link to="/hjem" className="navbar-link">Hjem</Link>
                    <Link to="/innboks" className="navbar-link">Innboks</Link>
                    <Link to="/avtaler" className="navbar-link">Avtaler</Link>
                    <Link to="/journal" className="navbar-link">Journal</Link>
                </div>
            </div>
            
            <div className="navbar-right">
                <span className="navbar-user-name">{brukerinfo.navn}</span>
                <img src={profilBilde} alt="Profil" className="navbar-profile-img" />
                <button onClick={onLoggUt} className="navbar-logout-btn">Logg ut</button>
            </div>
        </nav>
    )
}

export default Navbar