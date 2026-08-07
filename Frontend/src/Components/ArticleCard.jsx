import { Link } from 'react-router-dom'
import { formatearFecha, esVideo, rutaCompleta } from '../utils/format'
import VideoConRespaldo from './VideoConRespaldo'

const ArticleCard = ({ noticia }) => {
    return (
        <article className="article">
            {noticia.imagen && (
                <Link
                    className="article-image"
                    to={`/noticia/${noticia.id}`}
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    {esVideo(noticia.imagen) ? (
                        <VideoConRespaldo src={rutaCompleta(noticia.imagen)} muted loop playsInline />
                    ) : (
                        <img src={rutaCompleta(noticia.imagen)} alt="" loading="lazy" />
                    )}
                </Link>
            )}
            <h3>
                <Link to={`/noticia/${noticia.id}`}>{noticia.titulo}</Link>
            </h3>
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
