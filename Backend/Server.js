const fs = require('fs')
const http = require('http')
const https = require('https')

const app = require('./app')
const { config } = require('./config/env')
const { conectarBD, cerrarBD } = require('./config/db')
const { sembrar } = require('./config/sembrar')

const arrancar = async () => {
  const { persistente } = await conectarBD()
  if (persistente) {
    console.log('[db] Conectado a MongoDB (MONGO_URI).')
  } else {
    console.warn('[db] MONGO_URI no configurado. Usando MongoDB en memoria (los datos no persisten).')
    console.log('[db] Sembrando categorías, admin y noticias de ejemplo...')
    await sembrar()
  }

  let servidor
  let protocolo = 'http'
  if (config.SSL_CERT_PATH && config.SSL_KEY_PATH) {
    try {
      servidor = https.createServer(
        {
          cert: fs.readFileSync(config.SSL_CERT_PATH),
          key: fs.readFileSync(config.SSL_KEY_PATH),
        },
        app
      )
      protocolo = 'https'
    } catch (err) {
      console.error('[startup] No se pudieron leer los certificados SSL:', err.message)
      process.exit(1)
    }
  } else {
    servidor = http.createServer(app)
  }

  const cerrar = async (senal) => {
    console.log(`[shutdown] Recibida ${senal}, cerrando conexiones...`)
    servidor.close(async () => {
      try {
        await cerrarBD()
      } finally {
        process.exit(0)
      }
    })
  }

  process.on('SIGINT', () => cerrar('SIGINT'))
  process.on('SIGTERM', () => cerrar('SIGTERM'))

  servidor.listen(config.PORT, () => {
    console.log(`News Today API escuchando en ${protocolo}://localhost:${config.PORT} (${config.NODE_ENV})`)
  })
}

arrancar().catch((err) => {
  console.error('[startup] Error al arrancar:', err)
  process.exit(1)
})
