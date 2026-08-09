import { useEffect, useState } from 'react'
import { getAnuncios } from '../services/api'

const cache = new Map()

const cargarAnuncios = (pagina) => {
    if (!cache.has(pagina)) {
        cache.set(
            pagina,
            getAnuncios(pagina)
                .then((res) => res.data || [])
                .catch(() => [])
        )
    }
    return cache.get(pagina)
}

export const invalidarCacheAnuncios = () => {
    cache.clear()
}

const useAnuncios = (pagina = 'portada') => {
    const [anuncios, setAnuncios] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancel = false
        setLoading(true)
        cargarAnuncios(pagina).then((data) => {
            if (!cancel) {
                setAnuncios(data)
                setLoading(false)
            }
        })
        return () => {
            cancel = true
        }
    }, [pagina])

    return { anuncios, loading }
}

export default useAnuncios
