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
    cultura: 'Cultura',
    politica: 'Política',
    sociedad: 'Sociedad',
    sucesos: 'Sucesos',
    tiempo: 'Tiempo',
    empleo: 'Tablón',
}

export const PAGINAS = {
    portada: 'Portada',
    actualidad: 'Actualidad',
    deportes: 'Deportes',
    cultura: 'Cultura',
    politica: 'Política',
    sociedad: 'Sociedad',
    sucesos: 'Sucesos',
    tiempo: 'Tiempo',
    tablon: 'Tablón',
    busqueda: 'Búsqueda',
    login: 'Iniciar sesión',
    administracion: 'Administración',
}

export const PAGINA_POR_CATEGORIA = {
    actualidad: 'actualidad',
    deportes: 'deportes',
    cultura: 'cultura',
    politica: 'politica',
    sociedad: 'sociedad',
    sucesos: 'sucesos',
    tiempo: 'tiempo',
    empleo: 'tablon',
}

export const categoriaAPagina = (categoria) => PAGINA_POR_CATEGORIA[categoria] || 'portada'

export const rutaDeCategoria = (slug) => (slug === 'empleo' ? '/tablon' : `/${slug}`)
