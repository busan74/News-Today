import Actualidad from '../Components/Actualidad'
import Deportes from '../Components/Deportes'
import Pasatiempos from '../Components/Pasatiempos'
import Politica from '../Components/Politica'
import Sociedad from '../Components/Sociedad'
import Sucesos from '../Components/Sucesos'
import Tiempo from '../Components/Tiempo'
import Empleo from '../Components/Empleo'
import { usePageMeta } from '../hooks/usePageMeta'

const Home = () => {
    usePageMeta({
        title: 'Inicio',
        description: 'Toda la actualidad del día en News Today.',
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
            <section className="home-grid">
                <Deportes />
                <Politica />
                <Sociedad />
                <Sucesos />
            </section>
            <section className="home-grid">
                <Tiempo />
                <Empleo />
                <Pasatiempos />
            </section>
        </main>
    )
}

export default Home
