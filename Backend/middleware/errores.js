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

const esIdInvalido = (error) => error?.code === '22P02'

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err)

  if (err?.code === '23505') {
    return res.status(409).json({ success: false, error: 'El registro ya existe' })
  }
  if (err?.code === '23503') {
    return res.status(409).json({ success: false, error: 'El registro está en uso' })
  }
  if (esIdInvalido(err)) {
    return res.status(400).json({ success: false, error: 'Identificador inválido' })
  }
  if (err?.code === 'PGRST205') {
    return res.status(500).json({
      success: false,
      error: 'Base de datos no inicializada',
      detalle: 'Ejecuta supabase/schema.sql en el SQL Editor de Supabase y luego npm run seed',
    })
  }

  console.error('[error]', err)
  res.status(500).json({ success: false, error: 'Error interno del servidor' })
}

const notFound = (req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' })
}

module.exports = { validarResultados, errorHandler, notFound, esIdInvalido }
