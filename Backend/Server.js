const fs = require('fs')
const http = require('http')
const https = require('https')

const app = require('./app')
const { config } = require('./config/env')

const arrancar = () => {
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

  const cerrar = (senal) => {
    console.log(`[shutdown] Recibida ${senal}, cerrando conexiones...`)
    servidor.close(() => process.exit(0))
  }

  process.on('SIGINT', () => cerrar('SIGINT'))
  process.on('SIGTERM', () => cerrar('SIGTERM'))

  servidor.listen(config.PORT, () => {
    console.log(`Actualidad Las Cabezas API escuchando en ${protocolo}://localhost:${config.PORT} (${config.NODE_ENV})`)
  })
}

arrancar()
