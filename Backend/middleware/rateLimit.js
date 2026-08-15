// Límite de intentos simple en memoria (por IP).
// Suficiente para frenar ataques de fuerza bruta o abuso en endpoints sensibles.

const intentos = new Map()

const crearLimite = ({
  ventanaMs = 60 * 1000,
  max = 5,
  mensaje = 'Demasiadas solicitudes. Inténtalo de nuevo en un minuto.',
} = {}) => {
  if (process.env.NODE_ENV === 'test') return (req, res, next) => next()

  return (req, res, next) => {
    const clave = req.ip || req.socket?.remoteAddress || 'desconocido'
    const ahora = Date.now()

    const recientes = (intentos.get(clave) || []).filter((t) => ahora - t < ventanaMs)
    if (recientes.length >= max) {
      return res.status(429).json({ success: false, error: mensaje })
    }

    recientes.push(ahora)
    intentos.set(clave, recientes)
    next()
  }
}

module.exports = { crearLimite }
