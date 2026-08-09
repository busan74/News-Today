import useAnuncios from '../hooks/useAnuncios'
import { rutaCompleta } from '../utils/format'

const Anuncio = ({ posicion = 1 }) => {
    const { anuncios } = useAnuncios()

    if (anuncios.length === 0) return null
    const anuncio = anuncios.find((a) => Number(a.posicion) === Number(posicion))
    if (!anuncio) return null

    const contenido =
        anuncio.tipo === 'video' ? (
            <video
                className="anuncio-video"
                src={rutaCompleta(anuncio.contenido)}
                autoPlay
                muted
                loop
                playsInline
            />
        ) : (
            <img
                className="anuncio-img"
                src={rutaCompleta(anuncio.contenido)}
                alt={anuncio.empresa}
            />
        )

    const interno = (
        <>
            {contenido}
            <span className="anuncio-label">Anuncio {posicion}</span>
        </>
    )

    return (
        <div className="anuncio">
            {anuncio.enlace ? (
                <a
                    href={anuncio.enlace}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    aria-label={`Publicidad de ${anuncio.empresa}`}
                >
                    {interno}
                </a>
            ) : (
                interno
            )}
        </div>
    )
}

export default Anuncio
