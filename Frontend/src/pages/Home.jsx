import Portada from '../Components/Portada'
import Anuncio from '../Components/Anuncio'
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
            <div className="portada-fila">
                <aside className="portada-lateral" aria-label="Publicidad">
                    <div className="portada-lateral-inner">
                        <Anuncio slot={0} />
                        <Anuncio slot={1} />
                        <Anuncio slot={2} />
                    </div>
                </aside>
                <Portada />
                <aside className="portada-lateral" aria-label="Publicidad">
                    <div className="portada-lateral-inner">
                        <Anuncio slot={3} />
                        <Anuncio slot={4} />
                        <Anuncio slot={5} />
                    </div>
                </aside>
            </div>
            <div className="home-interior">
                <div className="anuncios-grandes">
                    <Anuncio slot={6} />
                    <Anuncio slot={7} />
                </div>
            </div>
        </main>
    )
}

export default Home
