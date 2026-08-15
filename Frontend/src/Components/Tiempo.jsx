import { useEffect, useState } from 'react'
import NewsSection from './NewsSection'
import { usePueblo } from '../hooks/usePueblo'

const COORDENADAS = {
    lascabezas: { lat: 36.9875, lon: -5.9394 },
    lebrija: { lat: 36.9165, lon: -6.0787 },
}

const ESTADOS_TIEMPO = {
    0: ['Despejado', '☀️'],
    1: ['Mayormente despejado', '🌤️'],
    2: ['Parcialmente nublado', '⛅'],
    3: ['Nublado', '☁️'],
    45: ['Niebla', '🌫️'],
    48: ['Niebla densa', '🌫️'],
    51: ['Llovizna', '🌦️'],
    53: ['Llovizna', '🌦️'],
    55: ['Llovizna', '🌧️'],
    61: ['Lluvia ligera', '🌧️'],
    63: ['Lluvia', '🌧️'],
    65: ['Lluvia fuerte', '🌧️'],
    80: ['Chubascos', '🌦️'],
    81: ['Chubascos', '🌧️'],
    82: ['Chubascos fuertes', '⛈️'],
    95: ['Tormenta', '⛈️'],
    96: ['Tormenta con granizo', '⛈️'],
    99: ['Tormenta fuerte', '⛈️'],
}

const Tiempo = () => {
    const { config } = usePueblo()
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [datos, setDatos] = useState(null)

    useEffect(() => {
        let activo = true
        const controlador = new AbortController()
        const coord = COORDENADAS[config.slug]

        const cargar = async () => {
            setCargando(true)
            setError(null)
            setDatos(null)
            if (!coord) {
                setCargando(false)
                setError('No hay datos meteorológicos para este municipio.')
                return
            }
            try {
                const url =
                    'https://api.open-meteo.com/v1/forecast?' +
                    `latitude=${coord.lat}&longitude=${coord.lon}` +
                    '&current=temperature_2m,weather_code' +
                    '&daily=temperature_2m_max,temperature_2m_min' +
                    '&timezone=Europe%2FMadrid&forecast_days=1'
                const res = await fetch(url, { signal: controlador.signal })
                if (!res.ok) throw new Error('Error de red')
                const json = await res.json()
                if (!activo) return
                setDatos(json)
            } catch (err) {
                if (activo && err.name !== 'AbortError') {
                    setError('Los datos del tiempo no están disponibles ahora mismo.')
                }
            } finally {
                if (activo) setCargando(false)
            }
        }

        cargar()

        return () => {
            activo = false
            controlador.abort()
        }
    }, [config.slug])

    const codigo = datos?.current?.weather_code
    const [descripcion, emoji] = ESTADOS_TIEMPO[codigo] || ['Condiciones mixtas', '🌡️']
    const temperatura = datos?.current?.temperature_2m
    const maxima = datos?.daily?.temperature_2m_max?.[0]
    const minima = datos?.daily?.temperature_2m_min?.[0]

    return (
        <NewsSection titulo="Tiempo" categoria="tiempo">
            {cargando && <p className="state">Cargando datos del tiempo…</p>}
            {error && <p className="state error">{error}</p>}
            {datos && temperatura !== undefined && (
                <div className="weather">
                    <span className="weather-icon" role="img" aria-label={descripcion}>
                        {emoji}
                    </span>
                    <div>
                        <strong>{Math.round(temperatura)}°C</strong>
                        <p>
                            {descripcion}, máxima de {Math.round(maxima)}°C y mínima de{' '}
                            {Math.round(minima)}°C
                        </p>
                    </div>
                </div>
            )}
        </NewsSection>
    )
}

export default Tiempo
