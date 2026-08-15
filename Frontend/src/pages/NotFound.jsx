import { Link } from 'react-router-dom'
import PaginaConAnuncios from '../Components/PaginaConAnuncios'
import { usePageMeta } from '../hooks/usePageMeta'

const NotFound = () => {
    usePageMeta({ title: 'Página no encontrada', noindex: true })

    return (
        <main id="main" className="home home--portada-ancha">
            <PaginaConAnuncios pagina="portada">
                <div className="page notfound-page">
                    <div className="form-card notfound">
                        <span className="notfound-code">404</span>
                        <h2 className="form-title">Página no encontrada</h2>
                        <p className="form-subtitle">
                            La página que buscas no existe o fue movida.
                        </p>
                        <Link to="/" className="btn notfound-btn">
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </PaginaConAnuncios>
        </main>
    )
}

export default NotFound
