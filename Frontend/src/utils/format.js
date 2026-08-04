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
    empleo: 'Empleo',
}
