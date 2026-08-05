import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { formatearFecha, NOMBRES_CATEGORIAS } from '../utils/format'
import { usePageMeta } from '../hooks/usePageMeta'

const VACIO = { id: null, categoria: 'actualidad', titulo: '', texto: '', imagen: '' }

const ANUNCIO_VACIO = {
    id: null,
    empresa: '',
    tipo: 'imagen',
    contenido: '',
    enlace: '',
    activo: true,
}

const Administracion = () => {
    usePageMeta({ title: 'Administración' })
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [noticias, setNoticias] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [form, setForm] = useState(VACIO)
    const [anuncios, setAnuncios] = useState(null)
    const [anuncioForm, setAnuncioForm] = useState(ANUNCIO_VACIO)

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
        })
    }

    const cancelar = () => {
        setForm(VACIO)
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
                })
            } else {
                await Api.post('/noticias', {
                    categoria: form.categoria,
                    titulo: form.titulo,
                    texto: form.texto,
                    imagen: form.imagen,
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
        })
    }

    const cancelarAnuncio = () => {
        setAnuncioForm(ANUNCIO_VACIO)
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
            }
            if (anuncioForm.id) {
                await Api.put(`/anuncios/${anuncioForm.id}`, datos)
            } else {
                await Api.post('/anuncios', datos)
            }
            cancelarAnuncio()
            await cargarAnuncios()
        } catch (err) {
            manejarError(err)
        }
    }

    const eliminarAnuncio = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar este anuncio?')) return
        setError('')
        try {
            await Api.del(`/anuncios/${id}`)
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
        <main id="main" className="home">
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
                        <div className="form-field">
                            <label htmlFor="admin-imagen">URL de la imagen:</label>
                            <input
                                id="admin-imagen"
                                type="url"
                                value={form.imagen}
                                placeholder="https://… o /images/noticia-1.jpg"
                                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                            />
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
                                    <h3>{n.titulo}</h3>
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
                            <label htmlFor="anuncio-contenido">URL de imagen o video:</label>
                            <input
                                id="anuncio-contenido"
                                type="url"
                                required
                                value={anuncioForm.contenido}
                                placeholder="https://…"
                                onChange={(e) =>
                                    setAnuncioForm({ ...anuncioForm, contenido: e.target.value })
                                }
                            />
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
                                        {a.tipo} · {a.activo ? 'Activo' : 'Inactivo'}
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
        </main>
    )
}

export default Administracion
