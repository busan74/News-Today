// Alta de editores (solo administradores). El registro público está cerrado.
// Uso: node scripts/crear-usuario.js <usuario> <email> <pueblo> [password]
require('../config/env')
const { getSupabase } = require('../config/supabase')
const { PUEBLOS } = require('../config/pueblos')

const main = async () => {
  const [usuario, email, pueblo, password] = process.argv.slice(2)
  if (!usuario || !email || !pueblo) {
    console.error('Uso: node scripts/crear-usuario.js <usuario> <email> <pueblo> [password]')
    process.exit(1)
  }
  if (!PUEBLOS[pueblo]) {
    console.error(`Pueblo inválido. Válidos: ${Object.keys(PUEBLOS).join(', ')}`)
    process.exit(1)
  }

  const clave = password || require('crypto').randomBytes(12).toString('hex')
  const supabase = getSupabase()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: clave,
    email_confirm: true,
    user_metadata: { username: usuario, role: 'editor', pueblo },
  })
  if (error) throw error

  const { error: errorPerfil } = await supabase
    .from('profiles')
    .insert({ id: data.user.id, username: usuario, email, role: 'editor', pueblo })
  if (errorPerfil) throw errorPerfil

  console.log(`Editor creado: ${usuario} <${email}> (${pueblo})`)
  console.log(`Contraseña: ${clave}`)
}

main().catch((err) => {
  console.error('[crear-usuario] Error:', err.message || err)
  process.exit(1)
})
