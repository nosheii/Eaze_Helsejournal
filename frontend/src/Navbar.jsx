import { Link } from 'react-router-dom'

function Navbar({ brukerinfo, onLoggUt }) {
    return (
        <nav style={{ 
            background: '#17a2b8', 
            padding: '1rem', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <h2 style={{ color: 'white', margin: 0 }}>Eaze</h2>
                <Link to="/hjem" style={{ color: 'white', textDecoration: 'none' }}>Hjem</Link>
                <Link to="/innboks" style={{ color: 'white', textDecoration: 'none' }}>Innboks</Link>
                <Link to="/avtaler" style={{ color: 'white', textDecoration: 'none' }}>Avtaler</Link>
                <Link to="/journal" style={{ color: 'white', textDecoration: 'none' }}>Journal</Link>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: 'white' }}>{brukerinfo.navn}</span>
                <button onClick={onLoggUt}>Logg ut</button>
            </div>
        </nav>
    )
}

export default Navbar
