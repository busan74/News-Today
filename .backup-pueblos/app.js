const { config } = require('./config/env')

const express = require('express')
const cors = require('cors')
const auth = require('./routes/auth')
const noticias = require('./routes/noticias')
const categorias = require('./routes/categorias')
const anuncios = require('./routes/anuncios')
const { errorHandler, notFound } = require('./middleware/errores')

const app = express()

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

app.use(cors({ origin: [...origenesPermitidos], credentials: true }))

if (config.TRUST_PROXY) {
  app.set('trust proxy', config.TRUST_PROXY)
}

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), (_req, res) => {
  res.status(501).json({ success: false, error: 'Pago de anuncios no implementado (Fase 2)' })
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Actualidad Las Cabezas funcionando',
    endpoints: {
      noticias: '/api/noticias',
      categorias: '/api/categorias',
      auth: '/api/auth/login',
      anuncios: '/api/anuncios',
    },
  })
})

app.use('/api/auth', auth)
app.use('/api/noticias', noticias)
app.use('/api/categorias', categorias)
app.use('/api/anuncios', anuncios)

app.use(notFound)
app.use(errorHandler)

module.exports = app
