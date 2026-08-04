require('./config/env')

const { conectarBD, cerrarBD } = require('./config/db')
const { sembrar } = require('./config/sembrar')

const seed = async () => {
  const { persistente } = await conectarBD()
  console.log(`[seed] BD ${persistente ? 'persistente' : 'en memoria'} conectada`)
  await sembrar()
  await cerrarBD()
  console.log('[seed] Listo.')
}

seed().catch((err) => {
  console.error('[seed] Error:', err)
  process.exit(1)
})
