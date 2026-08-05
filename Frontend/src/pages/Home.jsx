import Actualidad from '../Components/Actualidad'
import Deportes from '../Components/Deportes'
import Pasatiempos from '../Components/Pasatiempos'
import Politica from '../Components/Politica'
import Sociedad from '../Components/Sociedad'
import Sucesos from '../Components/Sucesos'
import Tiempo from '../Components/Tiempo'
import Empleo from '../Components/Empleo'
import Anuncio from '../Components/Anuncio'
import { usePageMeta } from '../hooks/usePageMeta'

const Home = () => {
    usePageMeta({
        title: 'Inicio',
        description: 'Toda la actualidad del día en Actualidad Las Cabezas.',
    })

    return (
        <main id="main" className="home">
            <section className="breaking">
                <span className="breaking-badge">Última hora</span>
                <p className="breaking-text">
                    La actualidad del día, minuto a minuto, en un solo lugar.
                </p>
            </section>
            <Actualidad />
            <Anuncio slot={0} />
            <section className="home-grid">
                <Deportes />
                <Politica />
                <Sociedad />
                <Sucesos />
            </section>
            <Anuncio slot={1} />
            <section className="home-grid">
                <Tiempo />
                <Empleo />
                <Pasatiempos />
            </section>
        </main>
    )
}

export default Home
