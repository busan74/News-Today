import { useNoticias } from '../hooks/useNoticias'
import ArticleCard from './ArticleCard'

const NewsSection = ({ titulo, categoria, featured = false, children }) => {
    const { noticias, loading, error } = useNoticias(categoria)

    return (
        <section className="section">
            <h2 className="section-title">{titulo}</h2>
            {children}
            {loading && <p className="state">Cargando noticias…</p>}
            {error && (
                <p className="state error">No se pudieron cargar las noticias: {error}</p>
            )}
            {noticias && noticias.length > 0 && (
                <div className="articles">
                    {noticias.map((n, i) => (
                        <ArticleCard
                            key={n.id}
                            noticia={n}
                            featured={featured && i === 0}
                        />
                    ))}
                </div>
            )}
            {noticias && noticias.length === 0 && !error && (
                <p className="state">Aún no hay noticias en esta sección.</p>
            )}
        </section>
    )
}

export default NewsSection
