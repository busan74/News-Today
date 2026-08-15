const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

const rutaEnv = path.resolve(__dirname, '..', '.env')
if (fs.existsSync(rutaEnv)) {
  dotenv.config({ path: rutaEnv })
} else {
  dotenv.config()
}

const NODE_ENV = process.env.NODE_ENV || 'development'
const esProduccion = NODE_ENV === 'production'

const parseTrustProxy = (valor) => {
  if (valor === 'true') return true
  if (!valor || valor === 'false') return false
  if (/^\d+$/.test(valor)) return Number(valor)
  return valor
}

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_JWKS_URL =
  process.env.SUPABASE_JWKS_URL || (SUPABASE_URL ? `${SUPABASE_URL}/auth/v1/.well-known/jwks.json` : '')

if (esProduccion) {
  const obligatorias = [
    ['SUPABASE_URL', 'URL del proyecto Supabase'],
    ['SUPABASE_SECRET_KEY', 'clave secreta (server) del proyecto Supabase'],
    ['ADMIN_PASS', 'contraseña del administrador (genera una segura, no uses la de ejemplo)'],
  ]
  for (const [clave, descripcion] of obligatorias) {
    if (!process.env[clave]) {
      throw new Error(`[env] En producción es obligatorio configurar ${clave} (${descripcion}).`)
    }
  }
}

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || `${ADMIN_USER}@news-today.local`

const config = {
  NODE_ENV,
  esProduccion,
  PORT: Number(process.env.PORT || 8080),
  CLIENT_URL,
  CORS_ORIGINS,
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || '',
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || '',
  SUPABASE_JWKS_URL,
  ADMIN_USER,
  ADMIN_EMAIL,
  ADMIN_PASS: process.env.ADMIN_PASS || '',
  SSL_CERT_PATH: process.env.SSL_CERT_PATH || null,
  SSL_KEY_PATH: process.env.SSL_KEY_PATH || null,
  TRUST_PROXY: parseTrustProxy(process.env.TRUST_PROXY),
}

module.exports = { config }
