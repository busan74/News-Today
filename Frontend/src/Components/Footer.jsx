import { Link } from 'react-router-dom'
import { NOMBRES_CATEGORIAS } from '../utils/format'

const Footer = () => {
    const anio = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer-grid">
                <div className="footer-col">
                    <div className="footer-brand">
                        <span className="navbar-logo">N</span>
                        <h3>News Today</h3>
                    </div>
                    <p>
                        Tu fuente diaria de actualidad, deportes, política y mucho
                        más, en un solo lugar.
                    </p>
                </div>
                <div className="footer-col">
                    <h4>Secciones</h4>
                    <nav className="footer-nav" aria-label="Secciones">
                        {Object.entries(NOMBRES_CATEGORIAS).map(([slug, nombre]) => (
                            <Link key={slug} to={`/${slug}`}>
                                {nombre}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="footer-col">
                    <h4>Cuenta</h4>
                    <nav className="footer-nav" aria-label="Cuenta">
                        <Link to="/suscripcion">Suscribirse</Link>
                        <Link to="/login">Iniciar sesión</Link>
                        <Link to="/administracion">Administración</Link>
                    </nav>
                </div>
            </div>
            <div className="footer-bottom">
                © {anio} News Today. Todos los derechos reservados.
            </div>
        </footer>
    )
}

export default Footer
