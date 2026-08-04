const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
const API_BASE = `${API_URL}/api`

const getToken = () => localStorage.getItem('nt_token')

const request = async (path, options = {}) => {
    const token = getToken()
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    })
    if (res.status === 401) {
        localStorage.removeItem('nt_token')
        throw new Error('No autorizado')
    }
    if (!res.ok) {
        throw new Error(`Error ${res.status} en ${path}`)
    }
    return res.json()
}

export const Api = {
    get: (path) => request(path),
    post: (path, body) =>
        request(path, {
            method: 'POST',
            body: JSON.stringify(body),
        }),
    put: (path, body) =>
        request(path, {
            method: 'PUT',
            body: JSON.stringify(body),
        }),
    del: (path) => request(path, { method: 'DELETE' }),
}

export const getNoticias = async (categoria, q) => {
    const params = new URLSearchParams()
    if (categoria) params.set('categoria', categoria)
    if (q) params.set('q', q)
    const query = params.toString()
    return Api.get(`/noticias${query ? `?${query}` : ''}`)
}

export const getCategorias = async () => {
    return Api.get('/categorias')
}

export const getNoticia = async (id) => {
    return Api.get(`/noticias/${id}`)
}
