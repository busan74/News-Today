const { Router } = require('express')
const { body } = require('express-validator')
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/noticiaController')
const { requireAuth } = require('../middleware/auth')
const { validarResultados } = require('../middleware/errores')

const router = Router()

router.get('/', listar)
router.get('/:id', obtener)

router.post(
  '/',
  requireAuth,
  [
    body('categoria').trim().notEmpty().withMessage('La categoría es obligatoria'),
    body('titulo').trim().notEmpty().withMessage('El título es obligatorio'),
    body('texto').trim().notEmpty().withMessage('El texto es obligatorio'),
    validarResultados,
  ],
  crear
)

router.put('/:id', requireAuth, actualizar)

router.delete('/:id', requireAuth, eliminar)

module.exports = router
