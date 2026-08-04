import { Link } from 'react-router-dom'
import { formatearFecha } from '../utils/format'

const ArticleCard = ({ noticia, featured = false }) => {
    return (
        <article className={featured ? 'article featured' : 'article'}>
            {noticia.imagen && (
                <Link
                    className="article-image"
                    to={`/noticia/${noticia.id}`}
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    <img src={noticia.imagen} alt="" loading="lazy" />
                </Link>
            )}
            <h3>
                <Link to={`/noticia/${noticia.id}`}>{noticia.titulo}</Link>
            </h3>
            <p>{noticia.texto}</p>
            {noticia.fecha && (
                <time className="article-date">{formatearFecha(noticia.fecha)}</time>
            )}
            <Link className="article-link" to={`/noticia/${noticia.id}`}>
                Leer más
            </Link>
        </article>
    )
}

export default ArticleCard
