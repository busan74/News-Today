const Usuario = require('../models/Usuario')
const { firmarToken } = require('../middleware/auth')

const registrar = async (req, res) => {
  const { username, email, password } = req.body
  const existentes = await Usuario.countDocuments()
  const usuario = new Usuario({
    username,
    email,
    password,
    role: existentes === 0 ? 'admin' : 'editor',
  })
  await usuario.save()
  const token = firmarToken(usuario)
  res.status(201).json({ success: true, token, user: usuario })
}

const iniciarSesion = async (req, res) => {
  const { username, password } = req.body
  const id = String(username || '').trim().toLowerCase()
  const usuario = await Usuario.findOne({ $or: [{ username: id }, { email: id }] }).select('+password')
  if (!usuario || !(await usuario.compararPassword(password))) {
    return res.status(401).json({ success: false, error: 'Credenciales incorrectas' })
  }
  const token = firmarToken(usuario)
  res.json({ success: true, token, user: usuario })
}

const perfil = async (req, res) => {
  const usuario = await Usuario.findById(req.user.id)
  if (!usuario) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
  }
  res.json({ success: true, data: usuario })
}

module.exports = { registrar, iniciarSesion, perfil }
