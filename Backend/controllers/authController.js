const { getSupabase, getClienteAuth } = require('../config/supabase')
const { detectarPueblo, PUEBLOS } = require('../config/pueblos')

const buscarPerfil = async (supabase, campo, valor) => {
  const { data, error } = await supabase.from('profiles').select('*').eq(campo, valor).maybeSingle()
  if (error) throw error
  return data
}

const contarPerfiles = async (supabase) => {
  const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
  if (error) throw error
  return count || 0
}

const registrar = async (req, res) => {
  const { username, email, password } = req.body
  const nombre = String(username || '').trim().toLowerCase()
  const correo = String(email || '').trim().toLowerCase()

  const supabase = getSupabase()

  if (await buscarPerfil(supabase, 'username', nombre)) {
    return res.status(409).json({ success: false, error: 'El registro ya existe' })
  }
  if (await buscarPerfil(supabase, 'email', correo)) {
    return res.status(409).json({ success: false, error: 'El registro ya existe' })
  }

  const total = await contarPerfiles(supabase)
  const esBootstrap = total === 0

  // Solo se permite el alta en dos casos:
  //  - bootstrap inicial (primer usuario de la instalación, se crea como admin);
  //  - un administrador autenticado que crea editores.
  let esAdmin = false
  if (req.user?.id) {
    const llamante = await buscarPerfil(supabase, 'id', req.user.id)
    esAdmin = llamante?.role === 'admin'
  }

  if (!esBootstrap && !esAdmin) {
    return res.status(403).json({
      success: false,
      error: 'El registro está cerrado. Contacta con el administrador para crear tu cuenta.',
    })
  }

  const role = esBootstrap ? 'admin' : 'editor'
  const puebloSolicitado = String(req.body.pueblo || '').trim().toLowerCase()
  const pueblo = PUEBLOS[puebloSolicitado] ? puebloSolicitado : detectarPueblo(req)

  const { data: creado, error: errorAuth } = await supabase.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
    user_metadata: { username: nombre, role, pueblo },
  })
  if (errorAuth) {
    return res.status(409).json({ success: false, error: 'El registro ya existe' })
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from('profiles')
    .insert({ id: creado.user.id, username: nombre, email: correo, role, pueblo })
    .select()
    .single()
  if (errorPerfil) {
    await supabase.auth.admin.deleteUser(creado.user.id).catch(() => {})
    throw errorPerfil
  }

  const { data: sesion, error: errorSesion } = await getClienteAuth().auth.signInWithPassword({
    email: correo,
    password,
  })
  if (errorSesion) throw errorSesion

  res.status(201).json({
    success: true,
    token: sesion.session.access_token,
    user: { id: perfil.id, username: perfil.username, email: correo, role: perfil.role, pueblo: perfil.pueblo },
  })
}

const iniciarSesion = async (req, res) => {
  const { username, password } = req.body
  const id = String(username || '').trim().toLowerCase()

  const supabase = getSupabase()

  let perfil = await buscarPerfil(supabase, 'username', id)
  if (!perfil) perfil = await buscarPerfil(supabase, 'email', id)
  if (!perfil) {
    return res.status(401).json({ success: false, error: 'Credenciales incorrectas' })
  }

  const { data: sesion, error } = await getClienteAuth().auth.signInWithPassword({
    email: perfil.email,
    password,
  })
  if (error || !sesion.session) {
    return res.status(401).json({ success: false, error: 'Credenciales incorrectas' })
  }

  res.json({
    success: true,
    token: sesion.session.access_token,
    user: { id: perfil.id, username: perfil.username, email: perfil.email, role: perfil.role, pueblo: perfil.pueblo },
  })
}

const perfil = async (req, res) => {
  const supabase = getSupabase()
  const usuario = await buscarPerfil(supabase, 'id', req.user.id)
  if (!usuario) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
  }
  res.json({ success: true, data: usuario })
}

module.exports = { registrar, iniciarSesion, perfil }
