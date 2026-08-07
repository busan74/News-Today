import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPortada } from '../services/api'
import { formatearFecha, NOMBRES_CATEGORIAS, esVideo, rutaCompleta } from '../utils/format'
import VideoConRespaldo from './VideoConRespaldo'

const Portada = () => {
    const [portada, setPortada] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancel = false

        const load = async () => {
            try {
                const res = await getPortada()
                if (!cancel) setPortada(res.data)
            } catch {
                if (!cancel) setPortada(null)
            } finally {
                if (!cancel) setLoading(false)
            }
        }

        load()

        return () => {
            cancel = true
        }
    }, [])

    if (loading || !portada) return null

    const conImagen = Boolean(portada.imagen)

    return (
        <article className={`portada${conImagen ? '' : ' portada--solo-texto'}`}>
            {conImagen && (
                <Link
                    className="portada-media"
                    to={`/noticia/${portada.id}`}
                    tabIndex={-1}
                >
                    {esVideo(portada.imagen) ? (
                        <VideoConRespaldo
                            src={rutaCompleta(portada.imagen)}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                        />
                    ) : (
                        <img src={rutaCompleta(portada.imagen)} alt="" />
                    )}
                </Link>
            )}
            <div className="portada-body">
                <span className="detail-category">
                    {NOMBRES_CATEGORIAS[portada.categoria] || portada.categoria}
                </span>
                <h1 className="portada-title">
                    <Link to={`/noticia/${portada.id}`}>{portada.titulo}</Link>
                </h1>
                {portada.fecha && (
                    <time className="article-date">{formatearFecha(portada.fecha)}</time>
                )}
                <p className="portada-texto">{portada.texto}</p>
                <Link className="article-link" to={`/noticia/${portada.id}`}>
                    Leer más
                </Link>
            </div>
        </article>
    )
}

export default Portada
