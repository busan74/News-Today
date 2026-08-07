const { createClient } = require('@supabase/supabase-js')
const ws = require('ws')
const { config } = require('./env')

let cliente = null

const getSupabase = () => {
  if (cliente) return cliente

  if (config.NODE_ENV === 'test') {
    const { crearFakeSupabase } = require('../tests/fakeSupabase')
    cliente = crearFakeSupabase().cliente
    return cliente
  }

  if (!config.SUPABASE_URL || !config.SUPABASE_SECRET_KEY) {
    throw new Error('[supabase] Falta configurar SUPABASE_URL y SUPABASE_SECRET_KEY en Backend/.env')
  }
  cliente = createClient(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: { transport: ws },
  })
  return cliente
}

const getClienteAuth = () => {
  if (config.NODE_ENV === 'test') return getSupabase()
  if (!config.SUPABASE_URL || !config.SUPABASE_SECRET_KEY) {
    throw new Error('[supabase] Falta configurar SUPABASE_URL y SUPABASE_SECRET_KEY en Backend/.env')
  }
  return createClient(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: { transport: ws },
  })
}

module.exports = { getSupabase, getClienteAuth }
