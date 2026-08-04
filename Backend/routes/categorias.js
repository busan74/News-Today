const { Router } = require('express')
const { body } = require('express-validator')
const { listar, crear, actualizar, eliminar } = require('../controllers/categoriaController')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { validarResultados } = require('../middleware/errores')

const router = Router()

router.get('/', listar)

router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('slug').trim().isLength({ min: 2 }).withMessage('El slug debe tener al menos 2 caracteres'),
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    validarResultados,
  ],
  crear
)

router.put('/:id', requireAuth, requireAdmin, actualizar)

router.delete('/:id', requireAuth, requireAdmin, eliminar)

module.exports = router
