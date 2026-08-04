const { validationResult } = require('express-validator')

const validarResultados = (req, res, next) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      detalles: errores.array().map((e) => e.msg),
    })
  }
  next()
}

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err)

  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ success: false, error: 'Datos inválidos', detalles: mensajes })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Identificador inválido' })
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, error: 'El registro ya existe' })
  }

  console.error('[error]', err)
  res.status(500).json({ success: false, error: 'Error interno del servidor' })
}

const notFound = (req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' })
}

module.exports = { validarResultados, errorHandler, notFound }
