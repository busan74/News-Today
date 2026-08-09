import Portada from '../Components/Portada'
import PaginaConAnuncios from '../Components/PaginaConAnuncios'
import { usePageMeta } from '../hooks/usePageMeta'
import { usePueblo } from '../hooks/usePueblo'

const Home = () => {
    const { config } = usePueblo()
    usePageMeta({
        title: 'Inicio',
        description: `Toda la actualidad del día en ${config.nombre}.`,
    })

    return (
        <main id="main" className="home home--portada-ancha">
            <div className="home-interior">
                <section className="breaking">
                    <span className="breaking-badge">Última hora</span>
                    <p className="breaking-text">
                        La actualidad del día, minuto a minuto, en un solo lugar.
                    </p>
                </section>
            </div>
            <PaginaConAnuncios pagina="portada">
                <Portada />
            </PaginaConAnuncios>
        </main>
    )
}

export default Home
