const jwt = require('jsonwebtoken')
const { config } = require('../config/env')

const firmarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id.toString(), username: usuario.username, role: usuario.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES }
  )
}

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    return res.status(401).json({ success: false, error: 'No autorizado' })
  }
  try {
    req.user = jwt.verify(token, config.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ success: false, error: 'No autorizado' })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Acceso denegado' })
  }
  next()
}

module.exports = { requireAuth, requireAdmin, firmarToken }
