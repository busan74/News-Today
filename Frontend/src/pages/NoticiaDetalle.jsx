import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getNoticia } from '../services/api'
import { useNoticias } from '../hooks/useNoticias'
import ArticleCard from '../Components/ArticleCard'
import Anuncio from '../Components/Anuncio'
import VideoConRespaldo from '../Components/VideoConRespaldo'
import { formatearFecha, NOMBRES_CATEGORIAS, esVideo, rutaCompleta } from '../utils/format'
import { usePageMeta } from '../hooks/usePageMeta'

const nombreCategoria = (slug) => NOMBRES_CATEGORIAS[slug] || slug

const NoticiaDetalle = () => {
    const { id } = useParams()
    const [noticia, setNoticia] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { noticias: relacionadas } = useNoticias(noticia?.categoria)

    usePageMeta({ title: noticia?.titulo, description: noticia?.texto })

    useEffect(() => {
        let cancel = false

        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await getNoticia(id)
                if (!cancel) setNoticia(res.data)
            } catch (e) {
                if (!cancel) setError(e.message)
            } finally {
                if (!cancel) setLoading(false)
            }
        }

        load()

        return () => {
            cancel = true
        }
    }, [id])

    if (loading) {
        return (
            <main id="main" className="home">
                <p className="state">Cargando noticia…</p>
            </main>
        )
    }

    if (error || !noticia) {
        return (
            <main id="main" className="home">
                <p className="state error">
                    {error ? `No se pudo cargar la noticia: ${error}` : 'Noticia no encontrada.'}
                </p>
            </main>
        )
    }

    const relacionadasCat = (relacionadas || [])
        .filter((n) => n.id !== noticia.id)
        .slice(0, 3)

    return (
        <main id="main" className="home">
            <Link className="back-link" to={`/${noticia.categoria}`}>
                ← Volver a {nombreCategoria(noticia.categoria)}
            </Link>
            <article className="detail-article">
                <span className="detail-category">
                    {nombreCategoria(noticia.categoria)}
                </span>
                {noticia.imagen &&
                    (esVideo(noticia.imagen) ? (
                        <VideoConRespaldo
                            className="detail-image"
                            src={rutaCompleta(noticia.imagen)}
                            controls
                            playsInline
                        />
                    ) : (
                        <img
                            className="detail-image"
                            src={rutaCompleta(noticia.imagen)}
                            alt={noticia.titulo}
                        />
                    ))}
                <h1 className="detail-title">{noticia.titulo}</h1>
                {noticia.fecha && (
                    <time className="detail-date">{formatearFecha(noticia.fecha)}</time>
                )}
                <p className="detail-body">{noticia.texto}</p>
            </article>
            <Anuncio slot={0} />
            {relacionadasCat.length > 0 && (
                <section className="section">
                    <h2 className="section-title">Relacionadas</h2>
                    <div className="articles">
                        {relacionadasCat.map((n) => (
                            <ArticleCard key={n.id} noticia={n} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    )
}

export default NoticiaDetalle
