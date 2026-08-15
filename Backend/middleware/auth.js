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
  }
}

const leerToken = (req) => {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7) : ''
}

const verificarToken = async (token) => {
  if (!jwks) throw new Error('JWKS no configurado')
  const { payload } = await jwtVerify(token, jwks, {
    audience: audiencia,
    issuer: emisor || undefined,
  })
  return construirUsuario(payload)
}

const descifrarTest = (token) => {
  const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))
  return construirUsuario(payload)
}

const requireAuth = async (req, res, next) => {
  const token = leerToken(req)
  if (!token) {
    return res.status(401).json({ success: false, error: 'No autorizado' })
  }

  try {
    req.user = config.NODE_ENV === 'test' ? descifrarTest(token) : await verificarToken(token)
    next()
  } catch {
    res.status(401).json({ success: false, error: 'No autorizado' })
  }
}

// Autenticación opcional: rellena req.user solo si llega un token válido.
// Nunca rechaza la petición (usado para el alta de usuarios).
const leerUsuario = async (req, _res, next) => {
  const token = leerToken(req)
  if (!token) return next()

  try {
    req.user = config.NODE_ENV === 'test' ? descifrarTest(token) : await verificarToken(token)
  } catch {
    // Token inválido: se ignora y se continúa sin usuario.
  }
  next()
}

const cargarPerfil = async (req) => {
  const { getSupabase } = require('../config/supabase')
  const { data: perfil, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', req.user?.id)
    .maybeSingle()
  if (error) throw error
  return perfil || null
}

// El rol se decide por la tabla profiles (fuente de verdad), nunca por claims del JWT.
const requireAdmin = async (req, res, next) => {
  try {
    const perfil = await cargarPerfil(req)
    if (perfil?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acceso denegado' })
    }
    req.perfil = perfil
    next()
  } catch {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' })
  }
}

// Un editor solo puede escribir en el pueblo al que pertenece.
// El administrador global puede gestionar todos los pueblos.
const verificarPueblo = async (req, res, next) => {
  try {
    const perfil = await cargarPerfil(req)
    if (!perfil) {
      return res.status(403).json({
        success: false,
        error: 'Tu cuenta no tiene un pueblo asignado. Contacta con el administrador.',
      })
    }
    if (perfil.role === 'admin') {
      req.perfil = perfil
      return next()
    }

    const { detectarPueblo } = require('../config/pueblos')
    const puebloPerfil = String(perfil.pueblo || '').toLowerCase()
    const puebloPeticion = detectarPueblo(req)

    if (!puebloPerfil) {
      return res.status(403).json({
        success: false,
        error: 'Tu cuenta no tiene un pueblo asignado. Contacta con el administrador.',
      })
    }
    if (puebloPerfil !== puebloPeticion) {
      return res.status(403).json({
        success: false,
        error: 'No puedes modificar el contenido de otro pueblo.',
      })
    }
    req.perfil = perfil
    next()
  } catch {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' })
  }
}

module.exports = { requireAuth, requireAdmin, verificarPueblo, leerUsuario }
