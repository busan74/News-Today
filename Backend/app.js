const path = require('path')
const fs = require('fs')

const { config } = require('./config/env')
const { detectarPueblo, obtenerConfig, obtenerTodos } = require('./config/pueblos')

const express = require('express')
const cors = require('cors')
const auth = require('./routes/auth')
const noticias = require('./routes/noticias')
const categorias = require('./routes/categorias')
const anuncios = require('./routes/anuncios')
const uploads = require('./routes/uploads')
const seo = require('./routes/seo')
const { errorHandler, notFound } = require('./middleware/errores')

const app = express()

const UPLOAD_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const origenesPermitidos = new Set()
if (!config.esProduccion) {
  for (const origen of ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']) {
    origenesPermitidos.add(origen)
  }
}
origenesPermitidos.add(config.CLIENT_URL)
for (const origen of config.CORS_ORIGINS) {
  origenesPermitidos.add(origen)
}

// Permite todos los subdominios del portal
const permitirCualquierOrigen = (origen, callback) => {
  if (!origen) return callback(null, true)
  if (origen.endsWith('.actualidadlocal.es') || origen === 'https://actualidadlocal.es') {
    return callback(null, true)
  }
  if (origenesPermitidos.has(origen)) return callback(null, true)
  return callback(null, false)
}

app.use(cors({ origin: permitirCualquierOrigen, credentials: true }))

if (config.TRUST_PROXY) {
  app.set('trust proxy', config.TRUST_PROXY)
}

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), (_req, res) => {
  res.status(501).json({ success: false, error: 'Pago de anuncios no implementado (Fase 2)' })
})

app.use(express.json({ limit: '75mb' }))
app.use(express.urlencoded({ extended: true, limit: '75mb' }))

app.use('/uploads', express.static(UPLOAD_DIR))

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Actualidad Local funcionando',
    endpoints: {
      config: '/api/config',
      noticias: '/api/noticias',
      categorias: '/api/categorias',
      auth: '/api/auth/login',
      anuncios: '/api/anuncios',
    },
  })
})

app.get('/api/config', (req, res) => {
  const slug = detectarPueblo(req)
  res.json({ success: true, data: obtenerConfig(slug), pueblos: obtenerTodos() })
})

app.use('/api/auth', auth)
app.use('/api/noticias', noticias)
app.use('/api/categorias', categorias)
app.use('/api/anuncios', anuncios)
app.use('/api/upload', uploads)

app.use(seo)

app.use(notFound)
app.use(errorHandler)

module.exports = app
