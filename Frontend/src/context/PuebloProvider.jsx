import { createContext, useEffect, useState } from 'react'
import { Api } from '../services/api'

export const DEFAULT_PUEBLO = {
    slug: 'lascabezas',
    nombre: 'Actualidad Las Cabezas',
    logo: 'LC',
    color: '#b3062e',
    colorDark: '#8f0424',
    dominio: 'lascabezas.actualidadlocal.es',
    descripcion: 'Noticias de Las Cabezas de San Juan',
}

export const PuebloContext = createContext({
    config: DEFAULT_PUEBLO,
    pueblos: [],
    loading: true,
})

const aplicarColores = (color, colorDark) => {
    const root = document.documentElement
    root.style.setProperty('--primary', color)
    root.style.setProperty('--primary-dark', colorDark)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', color)
}

export const PuebloProvider = ({ children }) => {
    const [config, setConfig] = useState(DEFAULT_PUEBLO)
    const [pueblos, setPueblos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            try {
                const res = await Api.get('/config')
                if (!activo) return
                const cfg = res.data || DEFAULT_PUEBLO
                setConfig(cfg)
                setPueblos(res.pueblos || [])
                aplicarColores(cfg.color, cfg.colorDark)
            } catch {
                if (activo) aplicarColores(DEFAULT_PUEBLO.color, DEFAULT_PUEBLO.colorDark)
            } finally {
                if (activo) setLoading(false)
            }
        }
        cargar()
        return () => {
            activo = false
        }
    }, [])

    return (
        <PuebloContext.Provider value={{ config, pueblos, loading }}>
            {children}
        </PuebloContext.Provider>
    )
}
