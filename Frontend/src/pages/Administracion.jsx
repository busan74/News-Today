import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { formatearFecha, NOMBRES_CATEGORIAS, PAGINAS, rutaCompleta } from '../utils/format'
import { invalidarCacheAnuncios } from '../hooks/useAnuncios'
import { usePageMeta } from '../hooks/usePageMeta'
import PreviaMultimedia from '../Components/PreviaMultimedia'
import PaginaConAnuncios from '../Components/PaginaConAnuncios'

const VACIO = { id: null, categoria: 'actualidad', titulo: '', texto: '', imagen: '', portada: false }

const ANUNCIO_VACIO = {
    id: null,
    empresa: '',
    tipo: 'imagen',
    contenido: '',
    enlace: '',
    activo: true,
    posicion: 1,
    pagina: 'portada',
}

const POSICIONES_ANUNCIOS = [1, 2, 3, 4, 5, 6, 7, 8]

const enParrillaDe = (a, pagina) => a.pagina === pagina && Number(a.posicion) >= 1 && Number(a.posicion) <= 8
const sinAsignar = (a) => !a.pagina || Number(a.posicion) === 0

const Administracion = () => {
    usePageMeta({ title: 'Administración', noindex: true })
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [noticias, setNoticias] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [form, setForm] = useState(VACIO)
    const [anuncios, setAnuncios] = useState(null)
    const [anuncioForm, setAnuncioForm] = useState(ANUNCIO_VACIO)
    const [subiendoImagen, setSubiendoImagen] = useState(false)
    const [errorImagen, setErrorImagen] = useState('')
    const [subiendoAnuncio, setSubiendoAnuncio] = useState(false)
    const [errorAnuncio, setErrorAnuncio] = useState('')
    const [arrastradoId, setArrastradoId] = useState(null)
    const [slotSobre, setSlotSobre] = useState(null)
    const [paginaSeleccionada, setPaginaSeleccionada] = useState('portada')

    const manejarError = useCallback(
        (err) => {
            if (err.message === 'No autorizado') {
                logout()
                navigate('/login')
            } else {
                setError(err.message)
            }
        },
        [logout, navigate]
    )

    const cargar = async () => {
        try {
            const res = await Api.get('/noticias')
            setNoticias(res.data)
        } catch (err) {
            manejarError(err)
        }
    }

    const cargarAnuncios = async () => {
        try {
            const res = await Api.get('/anuncios/todos')
            setAnuncios(res.data)
        } catch (err) {
            manejarError(err)
        }
    }

    useEffect(() => {
        let cancel = false

        const load = async () => {
            try {
                const res = await Api.get('/noticias')
                if (!cancel) setNoticias(res.data)
            } catch (err) {
                if (!cancel) manejarError(err)
            } finally {
                if (!cancel) setLoading(false)
            }
        }

        const loadAnuncios = async () => {
            try {
                const res = await Api.get('/anuncios/todos')
                if (!cancel) setAnuncios(res.data)
            } catch (err) {
                if (!cancel) manejarError(err)
            }
        }

        load()
        loadAnuncios()

        return () => {
            cancel = true
        }
    }, [manejarError])

    const editar = (n) => {
        setForm({
            id: n.id,
            categoria: n.categoria,
            titulo: n.titulo,
            texto: n.texto,
            imagen: n.imagen || '',
            portada: Boolean(n.portada),
        })
        setErrorImagen('')
    }

    const subirImagen = async (e) => {
        const archivo = e.target.files?.[0]
        if (!archivo) return
        setSubiendoImagen(true)
        setErrorImagen('')
        try {
            const dataUrl = await new Promise((resolve, reject) => {
                const lector = new FileReader()
                lector.onload = () => resolve(lector.result)
                lector.onerror = () => reject(new Error('No se pudo leer el archivo'))
                lector.readAsDataURL(archivo)
            })
            const res = await Api.post('/upload', { archivo: dataUrl })
            setForm({ ...form, imagen: res.url })
        } catch (err) {
            setErrorImagen(err.message)
        } finally {
            setSubiendoImagen(false)
        }
    }

    const subirContenidoAnuncio = async (e) => {
        const archivo = e.target.files?.[0]
        if (!archivo) return
        setSubiendoAnuncio(true)
        setErrorAnuncio('')
        try {
            const dataUrl = await new Promise((resolve, reject) => {
                const lector = new FileReader()
                lector.onload = () => resolve(lector.result)
                lector.onerror = () => reject(new Error('No se pudo leer el archivo'))
                lector.readAsDataURL(archivo)
            })
            const res = await Api.post('/upload', { archivo: dataUrl })
            setAnuncioForm({ ...anuncioForm, contenido: res.url })
        } catch (err) {
            setErrorAnuncio(err.message)
        } finally {
            setSubiendoAnuncio(false)
        }
    }

    const cancelar = () => {
        setForm(VACIO)
        setErrorImagen('')
    }

    const cancelarAnuncio = () => {
        setAnuncioForm(ANUNCIO_VACIO)
        setErrorAnuncio('')
    }

    const guardar = async (e) => {
        e.preventDefault()
        setError('')
        try {
            if (form.id) {
                await Api.put(`/noticias/${form.id}`, {
                    categoria: form.categoria,
                    titulo: form.titulo,
                    texto: form.texto,
                    imagen: form.imagen,
                    portada: form.portada,
                })
            } else {
                await Api.post('/noticias', {
                    categoria: form.categoria,
                    titulo: form.titulo,
                    texto: form.texto,
                    imagen: form.imagen,
                    portada: form.portada,
                })
            }
            cancelar()
            await cargar()
        } catch (err) {
            manejarError(err)
        }
    }

    const eliminar = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar esta noticia?')) return
        setError('')
        try {
            await Api.del(`/noticias/${id}`)
            await cargar()
        } catch (err) {
            manejarError(err)
        }
    }

    const editarAnuncio = (a) => {
        setAnuncioForm({
            id: a.id,
            empresa: a.empresa,
            tipo: a.tipo,
            contenido: a.contenido,
            enlace: a.enlace || '',
            activo: Boolean(a.activo),
            posicion: Number(a.posicion) || 1,
            pagina: a.pagina || 'portada',
        })
    }

    const guardarAnuncio = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const datos = {
                empresa: anuncioForm.empresa,
                tipo: anuncioForm.tipo,
                contenido: anuncioForm.contenido,
                enlace: anuncioForm.enlace,
                activo: anuncioForm.activo,
                posicion: Number(anuncioForm.posicion) || 1,
                pagina: anuncioForm.pagina || 'portada',
            }
            if (anuncioForm.id) {
                await Api.put(`/anuncios/${anuncioForm.id}`, datos)
            } else {
                await Api.post('/anuncios', datos)
            }
            cancelarAnuncio()
            invalidarCacheAnuncios()
            await cargarAnuncios()
        } catch (err) {
            manejarError(err)
        }
    }

    const inicioArrastre = (e, id) => {
        e.dataTransfer.setData('text/plain', String(id))
        e.dataTransfer.effectAllowed = 'move'
        setArrastradoId(id)
    }

    const finArrastre = () => {
        setArrastradoId(null)
        setSlotSobre(null)
    }

    const soltarAnuncio = async (e, posicion, pagina) => {
        e.preventDefault()
        const id = Number(e.dataTransfer.getData('text/plain')) || arrastradoId
        setArrastradoId(null)
        setSlotSobre(null)
        if (!id) return

        const origen = (anuncios || []).find((a) => a.id === id)
        if (!origen) return
        const pos = Number(posicion)
        const p = pagina || paginaSeleccionada

        try {
            if (pos === 0) {
                if (origen.pagina !== '' || Number(origen.posicion) !== 0) {
                    setAnuncios((lista) =>
                        lista.map((a) =>
                            a.id === id ? { ...a, pagina: '', posicion: 0 } : a
                        )
                    )
                    await Api.put(`/anuncios/${id}`, { pagina: '', posicion: 0 })
                }
            } else {
                const destino = (anuncios || []).find(
                    (a) => a.pagina === p && Number(a.posicion) === pos
                )
                if (destino && destino.id !== id) {
                    if (origen.pagina === p) {
                        const posOrigen = Number(origen.posicion)
                        setAnuncios((lista) =>
                            lista.map((a) =>
                                a.id === id
                                    ? { ...a, posicion: pos }
                                    : a.id === destino.id
                                        ? { ...a, posicion: posOrigen }
                                        : a
                            )
                        )
                        await Promise.all([
                            Api.put(`/anuncios/${id}`, { pagina: p, posicion: pos }),
                            Api.put(`/anuncios/${destino.id}`, { pagina: p, posicion: posOrigen }),
                        ])
                    } else {
                        setAnuncios((lista) =>
                            lista.map((a) =>
                                a.id === id
                                    ? { ...a, pagina: p, posicion: pos }
                                    : a.id === destino.id
                                        ? { ...a, pagina: '', posicion: 0 }
                                        : a
                            )
                        )
                        await Promise.all([
                            Api.put(`/anuncios/${id}`, { pagina: p, posicion: pos }),
                            Api.put(`/anuncios/${destino.id}`, { pagina: '', posicion: 0 }),
                        ])
                    }
                } else if (origen.pagina !== p || Number(origen.posicion) !== pos) {
                    setAnuncios((lista) =>
                        lista.map((a) => (a.id === id ? { ...a, pagina: p, posicion: pos } : a))
                    )
                    await Api.put(`/anuncios/${id}`, { pagina: p, posicion: pos })
                }
            }
        } catch (err) {
            manejarError(err)
        } finally {
            invalidarCacheAnuncios()
            await cargarAnuncios()
        }
    }

    const eliminarAnuncio = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar este anuncio?')) return
        setError('')
        try {
            await Api.del(`/anuncios/${id}`)
            invalidarCacheAnuncios()
            await cargarAnuncios()
        } catch (err) {
            manejarError(err)
        }
    }

    const salir = () => {
        logout()
        navigate('/login')
    }

    return (
        <main id="main" className="home home--portada-ancha">
            <PaginaConAnuncios pagina="administracion">
                <div className="admin-header">
                    <h1 className="search-title">Administración</h1>
                    <button type="button" className="btn-ghost" onClick={salir}>
                        Cerrar sesión
                    </button>
                </div>
                {error && <p className="state error">{error}</p>}
            <div className="admin-layout">
                <div className="form-card">
                    <h2 className="form-title">
                        {form.id ? 'Editar noticia' : 'Nueva noticia'}
                    </h2>
                    <form onSubmit={guardar} className="form">
                        <div className="form-field">
                            <label htmlFor="admin-categoria">Categoría:</label>
                            <select
                                id="admin-categoria"
                                value={form.categoria}
                                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                            >
                                {Object.entries(NOMBRES_CATEGORIAS).map(([slug, nombre]) => (
                                    <option key={slug} value={slug}>
                                        {nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="admin-titulo">Título:</label>
                            <input
                                id="admin-titulo"
                                type="text"
                                required
                                value={form.titulo}
                                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="admin-texto">Texto:</label>
                            <textarea
                                id="admin-texto"
                                required
                                value={form.texto}
                                onChange={(e) => setForm({ ...form, texto: e.target.value })}
                            />
                        </div>
                        <div className="form-field checkbox-field">
                            <label htmlFor="admin-portada">
                                <input
                                    id="admin-portada"
                                    type="checkbox"
                                    checked={form.portada}
                                    onChange={(e) =>
                                        setForm({ ...form, portada: e.target.checked })
                                    }
                                />
                                Noticia principal (portada)
                            </label>
                        </div>
                        <div className="form-field">
                            <label htmlFor="admin-imagen">Imagen o video (desde tu equipo):</label>
                            <input
                                key={form.id || 'nuevo'}
                                id="admin-imagen"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                                onChange={subirImagen}
                            />
                            <PreviaMultimedia src={form.imagen} alt="Vista previa de la imagen" />
                            {subiendoImagen && <p className="state">Subiendo archivo…</p>}
                            {errorImagen && <p className="state error">{errorImagen}</p>}
                            <p className="form-hint">
                                El archivo se guarda en el servidor (carpeta uploads). Para vídeo usa
                                MP4 (H.264) o WebM: si grabas con el móvil, evita formatos como HEVC
                                porque no se reproducen en todos los navegadores.
                            </p>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn">
                                {form.id ? 'Guardar cambios' : 'Crear noticia'}
                            </button>
                            {form.id && (
                                <button type="button" className="btn-ghost" onClick={cancelar}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <section className="section">
                    <h2 className="section-title">
                        Noticias {noticias ? `(${noticias.length})` : ''}
                    </h2>
                    {loading && <p className="state">Cargando…</p>}
                    {noticias &&
                        noticias.map((n) => (
                            <div className="admin-item" key={n.id}>
                                <div className="admin-item-info">
                                    <h3>
                                        {n.titulo}
                                        {n.portada && <span className="portada-badge">Portada</span>}
                                    </h3>
                                    <p>
                                        {NOMBRES_CATEGORIAS[n.categoria] || n.categoria} ·{' '}
                                        {formatearFecha(n.fecha)}
                                    </p>
                                </div>
                                <div className="admin-actions">
                                    <button
                                        type="button"
                                        className="btn-small edit"
                                        onClick={() => editar(n)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-small delete"
                                        onClick={() => eliminar(n.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    {noticias && noticias.length === 0 && (
                        <p className="state">No hay noticias todavía.</p>
                    )}
                </section>
            </div>

            <div className="admin-layout">
                <div className="form-card">
                    <h2 className="form-title">
                        {anuncioForm.id ? 'Editar anuncio' : 'Nuevo anuncio'}
                    </h2>
                    <form onSubmit={guardarAnuncio} className="form">
                        <div className="form-field">
                            <label htmlFor="anuncio-empresa">Empresa:</label>
                            <input
                                id="anuncio-empresa"
                                type="text"
                                required
                                value={anuncioForm.empresa}
                                onChange={(e) =>
                                    setAnuncioForm({ ...anuncioForm, empresa: e.target.value })
                                }
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="anuncio-tipo">Tipo:</label>
                            <select
                                id="anuncio-tipo"
                                value={anuncioForm.tipo}
                                onChange={(e) =>
                                    setAnuncioForm({ ...anuncioForm, tipo: e.target.value })
                                }
                            >
                                <option value="imagen">Imagen</option>
                                <option value="video">Video (15-20 s)</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="anuncio-contenido">
                                {anuncioForm.tipo === 'video'
                                    ? 'Video (desde tu equipo):'
                                    : 'Imagen (desde tu equipo):'}
                            </label>
                            <input
                                key={anuncioForm.id || anuncioForm.tipo}
                                id="anuncio-contenido"
                                type="file"
                                accept={
                                    anuncioForm.tipo === 'video'
                                        ? 'video/mp4,video/webm'
                                        : 'image/jpeg,image/png,image/webp,image/gif'
                                }
                                onChange={subirContenidoAnuncio}
                            />
                            <PreviaMultimedia src={anuncioForm.contenido} alt={anuncioForm.empresa} />
                            {subiendoAnuncio && <p className="state">Subiendo archivo…</p>}
                            {errorAnuncio && <p className="state error">{errorAnuncio}</p>}
                        </div>
                        <div className="form-field">
                            <label htmlFor="anuncio-enlace">Enlace al comercio:</label>
                            <input
                                id="anuncio-enlace"
                                type="url"
                                value={anuncioForm.enlace}
                                placeholder="https://…"
                                onChange={(e) =>
                                    setAnuncioForm({ ...anuncioForm, enlace: e.target.value })
                                }
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="anuncio-pagina">Página donde se muestra:</label>
                            <select
                                id="anuncio-pagina"
                                value={anuncioForm.pagina}
                                onChange={(e) =>
                                    setAnuncioForm({ ...anuncioForm, pagina: e.target.value })
                                }
                            >
                                {Object.entries(PAGINAS).map(([clave, nombre]) => (
                                    <option key={clave} value={clave}>
                                        {nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="anuncio-posicion">Número de posición (1-8):</label>
                            <input
                                id="anuncio-posicion"
                                type="number"
                                min="1"
                                max="8"
                                required
                                value={anuncioForm.posicion}
                                onChange={(e) =>
                                    setAnuncioForm({
                                        ...anuncioForm,
                                        posicion: Number(e.target.value),
                                    })
                                }
                            />
                            <p className="form-hint">
                                El anuncio 1-3 va en la columna izquierda (de arriba a abajo), el
                                4-6 en la derecha y el 7-8 son los anuncios grandes al final de
                                esa página. Cada página (portada, secciones, tablón, búsqueda,
                                login y administración) tiene su propia parrilla.
                            </p>
                        </div>
                        <div className="form-field checkbox-field">
                            <label htmlFor="anuncio-activo">
                                <input
                                    id="anuncio-activo"
                                    type="checkbox"
                                    checked={anuncioForm.activo}
                                    onChange={(e) =>
                                        setAnuncioForm({ ...anuncioForm, activo: e.target.checked })
                                    }
                                />
                                Activo en el sitio
                            </label>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn">
                                {anuncioForm.id ? 'Guardar cambios' : 'Crear anuncio'}
                            </button>
                            {anuncioForm.id && (
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={cancelarAnuncio}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <section className="section">
                    <h2 className="section-title">
                        Anuncios {anuncios ? `(${anuncios.length})` : ''}
                    </h2>
                    {anuncios &&
                        anuncios.map((a) => (
                            <div className="admin-item" key={a.id}>
                                <div className="admin-item-info">
                                    <h3>{a.empresa}</h3>
                                    <p>
                                        {a.tipo} · {a.activo ? 'Activo' : 'Inactivo'} ·{' '}
                                        {PAGINAS[a.pagina] || 'Sin asignar'}
                                        {Number(a.posicion) > 0 ? ` · Anuncio ${a.posicion}` : ''}
                                    </p>
                                </div>
                                <div className="admin-actions">
                                    <button
                                        type="button"
                                        className="btn-small edit"
                                        onClick={() => editarAnuncio(a)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-small delete"
                                        onClick={() => eliminarAnuncio(a.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    {anuncios && anuncios.length === 0 && (
                        <p className="state">No hay anuncios todavía.</p>
                    )}
                </section>
            </div>

            <section className="section parrilla-section">
                <h2 className="section-title">Parrilla de anuncios de cada página</h2>
                <p className="form-hint">
                    Elige una página y ordena sus 8 anuncios arrastrando con el botón izquierdo
                    del ratón (arriba, abajo, izquierda o derecha). Al soltarlo se guarda solo.
                    También puedes arrastrar un anuncio de "Sin asignar" a una casilla.
                </p>
                <div className="form-field parrilla-selector">
                    <label htmlFor="parrilla-pagina">Mostrar la parrilla de:</label>
                    <select
                        id="parrilla-pagina"
                        value={paginaSeleccionada}
                        onChange={(e) => {
                            setPaginaSeleccionada(e.target.value)
                            setSlotSobre(null)
                        }}
                    >
                        {Object.entries(PAGINAS).map(([clave, nombre]) => (
                            <option key={clave} value={clave}>
                                {nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="parrilla-anuncios">
                    {POSICIONES_ANUNCIOS.map((pos) => {
                        const a = (anuncios || []).find(
                            (x) => x.pagina === paginaSeleccionada && Number(x.posicion) === pos
                        )
                        return (
                            <div
                                key={pos}
                                className={`casilla-anuncio ${
                                    a ? 'casilla-anuncio--llena' : 'casilla-anuncio--vacia'
                                } ${slotSobre === pos ? 'casilla-anuncio--target' : ''}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={(e) => {
                                    e.preventDefault()
                                    setSlotSobre(pos)
                                }}
                                onDragLeave={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                        setSlotSobre((s) => (s === pos ? null : s))
                                    }
                                }}
                                onDrop={(e) => soltarAnuncio(e, pos, paginaSeleccionada)}
                            >
                                <span className="casilla-anuncio-num">Anuncio {pos}</span>
                                {a ? (
                                    <div
                                        className={`contenido-arrastrable ${
                                            arrastradoId === a.id ? 'anuncio-arrastrado' : ''
                                        }`}
                                        draggable
                                        onDragStart={(e) => inicioArrastre(e, a.id)}
                                        onDragEnd={finArrastre}
                                    >
                                        {a.tipo === 'video' ? (
                                            <video
                                                className="casilla-anuncio-img"
                                                src={rutaCompleta(a.contenido)}
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                className="casilla-anuncio-img"
                                                src={rutaCompleta(a.contenido)}
                                                alt={a.empresa}
                                            />
                                        )}
                                        <span className="casilla-anuncio-nombre">{a.empresa}</span>
                                    </div>
                                ) : (
                                    <span>Sin anuncio</span>
                                )}
                            </div>
                        )
                    })}
                </div>
                {(anuncios || []).filter(sinAsignar).length > 0 && (
                    <div
                        className="parrilla-sin-asignar"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => soltarAnuncio(e, 0, '')}
                    >
                        <p className="form-hint parrilla-sin-asignar-titulo">
                            Sin asignar (no se muestran en ninguna página): arrastra aquí un
                            anuncio para desasignarlo, o arrastra uno de esta lista a una casilla.
                        </p>
                        <div className="parrilla-sin-asignar-items">
                            {(anuncios || [])
                                .filter(sinAsignar)
                                .map((a) => (
                                    <div
                                        key={a.id}
                                        className={`casilla-sin-asignar ${
                                            arrastradoId === a.id ? 'anuncio-arrastrado' : ''
                                        }`}
                                        draggable
                                        onDragStart={(e) => inicioArrastre(e, a.id)}
                                        onDragEnd={finArrastre}
                                    >
                                        {a.empresa}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </section>
            </PaginaConAnuncios>
        </main>
    )
}

export default Administracion
