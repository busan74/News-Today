import { Routes, Route } from 'react-router-dom'
import Navbar from './pages/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Administracion from './pages/Administracion'
import NoticiaDetalle from './pages/NoticiaDetalle'
import Busqueda from './pages/Busqueda'
import NotFound from './pages/NotFound'
import ProtectedRoute from './pages/ProtectedRoute'
import Footer from './Components/Footer'
import Actualidad from './Components/Actualidad'
import Deportes from './Components/Deportes'
import Pasatiempos from './Components/Pasatiempos'
import Politica from './Components/Politica'
import Sociedad from './Components/Sociedad'
import Sucesos from './Components/Sucesos'
import Tiempo from './Components/Tiempo'
import Tablon from './Components/Tablon'
import { usePageMeta } from './hooks/usePageMeta'

const CATEGORIAS_DESC = {
    actualidad: 'Últimas noticias de actualidad, minuto a minuto.',
    deportes: 'Resultados, crónicas y novedades del mundo del deporte.',
    pasatiempos: 'Ideas para el tiempo libre: lectura, ocio y más.',
    politica: 'Análisis y noticias del ámbito político.',
    sociedad: 'La actualidad social, cultural y comunitaria.',
    sucesos: 'Información y novedades sobre sucesos y seguridad.',
    tiempo: 'El pronóstico del tiempo para tu día a día.',
    empleo: 'Anuncios, avisos y novedades del municipio.',
}

const SectionPage = ({ title, description, children }) => {
    usePageMeta({ title, description })
    return (
        <main id="main" className="home">
            {children}
        </main>
    )
}

const Categoria = ({ slug, children }) => {
    const nombre = slug.charAt(0).toUpperCase() + slug.slice(1)
    return (
        <SectionPage title={nombre} description={CATEGORIAS_DESC[slug]}>
            {children}
        </SectionPage>
    )
}

function App() {
    return (
        <div className="app">
            <a className="skip-link" href="#main">
                Saltar al contenido
            </a>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/actualidad" element={<Categoria slug="actualidad"><Actualidad /></Categoria>} />
                <Route path="/deportes" element={<Categoria slug="deportes"><Deportes /></Categoria>} />
                <Route path="/pasatiempos" element={<Categoria slug="pasatiempos"><Pasatiempos /></Categoria>} />
                <Route path="/politica" element={<Categoria slug="politica"><Politica /></Categoria>} />
                <Route path="/sociedad" element={<Categoria slug="sociedad"><Sociedad /></Categoria>} />
                <Route path="/sucesos" element={<Categoria slug="sucesos"><Sucesos /></Categoria>} />
                <Route path="/tiempo" element={<Categoria slug="tiempo"><Tiempo /></Categoria>} />
                <Route path="/tablon" element={<Categoria slug="empleo"><Tablon /></Categoria>} />
                <Route path="/noticia/:id" element={<NoticiaDetalle />} />
                <Route path="/busqueda" element={<Busqueda />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/administracion"
                    element={
                        <ProtectedRoute>
                            <Administracion />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </div>
    )
}

export default App
