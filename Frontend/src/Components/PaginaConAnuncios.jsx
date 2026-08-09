import Anuncio from './Anuncio'

const PaginaConAnuncios = ({ pagina = 'portada', children }) => (
    <>
        <div className="portada-fila pagina-con-anuncios">
            <aside className="portada-lateral" aria-label="Publicidad">
                <div className="portada-lateral-inner">
                    <Anuncio pagina={pagina} posicion={1} />
                    <Anuncio pagina={pagina} posicion={2} />
                    <Anuncio pagina={pagina} posicion={3} />
                </div>
            </aside>
            <div className="contenido-principal">{children}</div>
            <aside className="portada-lateral" aria-label="Publicidad">
                <div className="portada-lateral-inner">
                    <Anuncio pagina={pagina} posicion={4} />
                    <Anuncio pagina={pagina} posicion={5} />
                    <Anuncio pagina={pagina} posicion={6} />
                </div>
            </aside>
        </div>
        <div className="home-interior">
            <div className="anuncios-grandes">
                <Anuncio pagina={pagina} posicion={7} />
                <Anuncio pagina={pagina} posicion={8} />
            </div>
        </div>
    </>
)

export default PaginaConAnuncios
