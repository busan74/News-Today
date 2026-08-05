require('./config/env')

const { sembrar } = require('./config/sembrar')

const seed = async () => {
  console.log('[seed] Conectando a Supabase...')
  await sembrar()
  console.log('[seed] Listo.')
}

seed().catch((err) => {
  console.error('[seed] Error:', err)
  process.exit(1)
})
