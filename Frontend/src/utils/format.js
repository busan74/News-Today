export const esVideo = (url) => /\.(mp4|webm|ogv)(\?|#|$)/i.test(String(url || ''))

export const rutaCompleta = (url) => {
    if (!url) return url
    const api = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
    if (api && url.startsWith('/uploads/')) {
        return `${api}${url}`
    }
    return url
}

export const formatearFecha = (fecha) => {
    if (!fecha) return ''
    const d = new Date(fecha)
    return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export const NOMBRES_CATEGORIAS = {
    actualidad: 'Actualidad',
    deportes: 'Deportes',
    pasatiempos: 'Pasatiempos',
    politica: 'Política',
    sociedad: 'Sociedad',
    sucesos: 'Sucesos',
    tiempo: 'Tiempo',
    empleo: 'Tablón',
}
