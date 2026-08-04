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

if (esProduccion) {
  const obligatorias = [
    ['JWT_SECRET', 'secreto para firmar los tokens'],
    ['MONGO_URI', 'URI de conexión a MongoDB'],
  ]
  for (const [clave, descripcion] of obligatorias) {
    if (!process.env[clave]) {
      throw new Error(`[env] En producción es obligatorio configurar ${clave} (${descripcion}).`)
    }
  }
} else {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret-desarrollo-cambiar-en-produccion'
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret-desarrollo-cambiar-en-produccion') {
  console.warn('[env] JWT_SECRET no configurado. Define uno propio en Backend/.env (no sirvas producción con este).')
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
  MONGO_URI: process.env.MONGO_URI || null,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: process.env.JWT_EXPIRES || '7d',
  ADMIN_USER,
  ADMIN_EMAIL,
  ADMIN_PASS: process.env.ADMIN_PASS || 'password',
  SSL_CERT_PATH: process.env.SSL_CERT_PATH || null,
  SSL_KEY_PATH: process.env.SSL_KEY_PATH || null,
  TRUST_PROXY: parseTrustProxy(process.env.TRUST_PROXY),
}

module.exports = { config }
