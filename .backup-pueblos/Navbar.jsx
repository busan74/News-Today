import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
    const [termino, setTermino] = useState('')
    const { isAuth, logout } = useAuth()
    const navigate = useNavigate()

    const links = [
        { to: '/', label: 'Inicio' },
        { to: '/actualidad', label: 'Actualidad' },
        { to: '/deportes', label: 'Deportes' },
        { to: '/pasatiempos', label: 'Pasatiempos' },
        { to: '/politica', label: 'Política' },
        { to: '/sociedad', label: 'Sociedad' },
        { to: '/sucesos', label: 'Sucesos' },
        { to: '/tiempo', label: 'Tiempo' },
        { to: '/empleo', label: 'Empleo' },
    ]

    const handleSearch = (e) => {
        e.preventDefault()
        const t = termino.trim()
        if (t) navigate(`/busqueda?q=${encodeURIComponent(t)}`)
    }

    return (
        <header className="navbar">
            <NavLink to="/" className="navbar-brand">
                <span className="navbar-logo">LC</span>
                Actualidad Las Cabezas
            </NavLink>
            <nav className="navbar-links">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/'}
                        className={({ isActive }) =>
                            isActive ? 'navbar-link active' : 'navbar-link'
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
            <div className="navbar-actions">
                <form onSubmit={handleSearch} className="navbar-search" role="search">
                    <input
                        value={termino}
                        onChange={(e) => setTermino(e.target.value)}
                        placeholder="Buscar…"
                        aria-label="Buscar noticias"
                        className="navbar-search-input"
                    />
                </form>
                {isAuth ? (
                    <>
                        <NavLink to="/administracion" className="navbar-action">
                            Admin
                        </NavLink>
                        <button
                            type="button"
                            className="navbar-action login"
                            onClick={() => logout()}
                        >
                            Salir
                        </button>
                    </>
                ) : (
                    <NavLink to="/login" className="navbar-action login">
                        Iniciar sesión
                    </NavLink>
                )}
            </div>
        </header>
    )
}

export default Navbar
