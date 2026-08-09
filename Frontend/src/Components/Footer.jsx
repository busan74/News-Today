import { Link } from 'react-router-dom'
import { NOMBRES_CATEGORIAS, rutaDeCategoria } from '../utils/format'
import { usePueblo } from '../hooks/usePueblo'

const Footer = () => {
    const anio = new Date().getFullYear()
    const { config, pueblos } = usePueblo()
    const otrosPueblos = pueblos.filter((p) => p.slug !== config.slug)

    return (
        <footer className="footer">
            <div className="footer-grid">
                <div className="footer-col">
                    <div className="footer-brand">
                        <span className="navbar-logo">{config.logo}</span>
                        <h3>{config.nombre}</h3>
                    </div>
                    <p>{config.descripcion}</p>
                </div>
                <div className="footer-col">
                    <h4>Secciones</h4>
                    <nav className="footer-nav" aria-label="Secciones">
                        {Object.entries(NOMBRES_CATEGORIAS).map(([slug, nombre]) => (
                            <Link key={slug} to={rutaDeCategoria(slug)}>
                                {nombre}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="footer-col">
                    <h4>Portales</h4>
                    <nav className="footer-nav" aria-label="Otros pueblos">
                        <a href="https://actualidadlocal.es">Actualidad Local</a>
                        {otrosPueblos.map((p) => (
                            <a key={p.slug} href={`https://${p.dominio}`}>
                                {p.nombre}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
            <div className="footer-bottom">
                © {anio} {config.nombre}. Todos los derechos reservados.
            </div>
        </footer>
    )
}

export default Footer
