import { useEffect, useState } from 'react'
import { getNoticias } from '../services/api'

export const useNoticias = (categoria, q) => {
    const [noticias, setNoticias] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancel = false

        const load = async () => {
            if (!categoria && !q) {
                setNoticias(null)
                setLoading(false)
                setError(null)
                return
            }
            setLoading(true)
            setError(null)
            try {
                const res = await getNoticias(categoria, q)
                if (!cancel) setNoticias(res.data)
            } catch (e) {
                if (!cancel) setError(e.message)
            } finally {
                if (!cancel) setLoading(false)
            }
        }

        load()

        return () => {
            cancel = true
        }
    }, [categoria, q])

    return { noticias, loading, error }
}
