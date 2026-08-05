import useAnuncios from '../hooks/useAnuncios'

const Anuncio = ({ slot = 0 }) => {
    const { anuncios } = useAnuncios()

    if (anuncios.length === 0) return null
    const anuncio = anuncios[slot % anuncios.length]

    const contenido =
        anuncio.tipo === 'video' ? (
            <video
                className="anuncio-video"
                src={anuncio.contenido}
                autoPlay
                muted
                loop
                playsInline
            />
        ) : (
            <img className="anuncio-img" src={anuncio.contenido} alt={anuncio.empresa} />
        )

    const interno = (
        <>
            {contenido}
            <span className="anuncio-label">Publicidad</span>
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
