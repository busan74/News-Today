const { createRemoteJWKSet, jwtVerify } = require('jose')
const { config } = require('../config/env')

const jwks = config.SUPABASE_JWKS_URL
  ? createRemoteJWKSet(new URL(config.SUPABASE_JWKS_URL))
  : null

const audiencia = 'authenticated'
const emisor = config.SUPABASE_URL ? `${config.SUPABASE_URL.replace(/\/$/, '')}/auth/v1` : null

const construirUsuario = (payload) => {
  const metadatos = payload.user_metadata || payload.app_metadata || {}
  return {
    id: payload.sub,
    email: payload.email || metadatos.email || '',
    username: metadatos.username || payload.email || '',
    role: metadatos.role === 'admin' ? 'admin' : 'editor',
  }
}

const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    return res.status(401).json({ success: false, error: 'No autorizado' })
  }

  if (config.NODE_ENV === 'test') {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))
      req.user = construirUsuario(payload)
      return next()
    } catch {
      return res.status(401).json({ success: false, error: 'No autorizado' })
    }
  }

  if (!jwks) {
    return res.status(401).json({ success: false, error: 'No autorizado' })
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      audience: audiencia,
      issuer: emisor || undefined,
    })
    req.user = construirUsuario(payload)
    next()
  } catch {
    res.status(401).json({ success: false, error: 'No autorizado' })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Acceso denegado' })
  }
  next()
}

module.exports = { requireAuth, requireAdmin }
