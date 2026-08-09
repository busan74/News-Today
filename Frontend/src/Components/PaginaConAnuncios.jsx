import Anuncio from './Anuncio'

const PaginaConAnuncios = ({ children }) => (
    <>
        <div className="portada-fila pagina-con-anuncios">
            <aside className="portada-lateral" aria-label="Publicidad">
                <div className="portada-lateral-inner">
                    <Anuncio posicion={1} />
                    <Anuncio posicion={2} />
                    <Anuncio posicion={3} />
                </div>
            </aside>
            <div className="contenido-principal">{children}</div>
            <aside className="portada-lateral" aria-label="Publicidad">
                <div className="portada-lateral-inner">
                    <Anuncio posicion={4} />
                    <Anuncio posicion={5} />
                    <Anuncio posicion={6} />
                </div>
            </aside>
        </div>
        <div className="home-interior">
            <div className="anuncios-grandes">
                <Anuncio posicion={7} />
                <Anuncio posicion={8} />
            </div>
        </div>
    </>
)

export default PaginaConAnuncios
