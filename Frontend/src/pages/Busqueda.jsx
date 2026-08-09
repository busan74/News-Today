import { useSearchParams } from 'react-router-dom'
import { useNoticias } from '../hooks/useNoticias'
import ArticleCard from '../Components/ArticleCard'
import PaginaConAnuncios from '../Components/PaginaConAnuncios'
import { NOMBRES_CATEGORIAS } from '../utils/format'
import { usePageMeta } from '../hooks/usePageMeta'

const Busqueda = () => {
    usePageMeta({
        title: 'Buscar noticias',
        description: 'Busca noticias por palabra clave y categoría.',
    })
    const [searchParams, setSearchParams] = useSearchParams()
    const q = searchParams.get('q') || ''
    const categoria = searchParams.get('categoria') || ''
    const { noticias, loading, error } = useNoticias(
        categoria || undefined,
        q || undefined
    )

    const aplicar = (nuevoTermino, nuevaCategoria) => {
        const params = new URLSearchParams()
        if (nuevoTermino.trim()) params.set('q', nuevoTermino.trim())
        if (nuevaCategoria) params.set('categoria', nuevaCategoria)
        setSearchParams(params)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const termino = new FormData(e.currentTarget).get('q').toString()
        aplicar(termino, categoria)
    }

    const handleCategoria = (e) => {
        aplicar(q, e.target.value)
    }

    const hayBusqueda = Boolean(q || categoria)

    return (
        <main id="main" className="home home--portada-ancha">
            <PaginaConAnuncios pagina="busqueda">
                <h1 className="search-title">Buscar noticias</h1>
                <form onSubmit={handleSubmit} className="search-form">
                    <input
                        className="search-input"
                        name="q"
                        key={q}
                        defaultValue={q}
                        placeholder="Buscar por palabra clave…"
                    />
                    <select
                        className="search-select"
                        value={categoria}
                        onChange={handleCategoria}
                    >
                        <option value="">Todas las categorías</option>
                        {Object.entries(NOMBRES_CATEGORIAS).map(([slug, nombre]) => (
                            <option key={slug} value={slug}>
                                {nombre}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="btn">
                        Buscar
                    </button>
                </form>

                {!hayBusqueda && (
                    <p className="state">
                        Escribe un término o elige una categoría para buscar.
                    </p>
                )}
                {loading && hayBusqueda && <p className="state">Buscando…</p>}
                {error && hayBusqueda && (
                    <p className="state error">Error al buscar: {error}</p>
                )}
                {noticias && hayBusqueda && noticias.length > 0 && (
                    <>
                        <p className="search-count">
                            {noticias.length} resultado{noticias.length !== 1 ? 's' : ''}
                        </p>
                        <div className="articles">
                            {noticias.map((n) => (
                                <ArticleCard key={n.id} noticia={n} />
                            ))}
                        </div>
                    </>
                )}
                {noticias && hayBusqueda && noticias.length === 0 && !error && (
                    <p className="state">
                        No se encontraron noticias con esos criterios.
                    </p>
                )}
            </PaginaConAnuncios>
        </main>
    )
}

export default Busqueda
