import { useEffect, useState } from 'react'
import { getAnuncios } from '../services/api'

let cache = null

const cargarAnuncios = () => {
    if (!cache) {
        cache = getAnuncios()
            .then((res) => res.data || [])
            .catch(() => [])
    }
    return cache
}

const useAnuncios = () => {
    const [anuncios, setAnuncios] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancel = false
        cargarAnuncios().then((data) => {
            if (!cancel) {
                setAnuncios(data)
                setLoading(false)
            }
        })
        return () => {
            cancel = true
        }
    }, [])

    return { anuncios, loading }
}

export default useAnuncios
