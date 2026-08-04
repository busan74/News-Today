import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { formatearFecha, NOMBRES_CATEGORIAS } from '../utils/format'
import { usePageMeta } from '../hooks/usePageMeta'

const VACIO = { id: null, categoria: 'actualidad', titulo: '', texto: '', imagen: '' }

const Administracion = () => {
    usePageMeta({ title: 'Administración' })
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [noticias, setNoticias] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [form, setForm] = useState(VACIO)

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

        load()

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
        </main>
    )
}

export default Administracion
