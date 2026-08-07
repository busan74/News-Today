import useAnuncios from '../hooks/useAnuncios'
import Anuncio from './Anuncio'

const Anuncios = ({ max = 4 }) => {
    const { anuncios } = useAnuncios()

    if (anuncios.length === 0) return null
    const visibles = anuncios.slice(0, max)

    return (
        <div className="anuncios-grid">
            {visibles.map((a, i) => (
                <Anuncio key={a.id} slot={i} />
            ))}
        </div>
    )
}

export default Anuncios
