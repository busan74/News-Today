const { Router } = require('express')
const { body } = require('express-validator')
const {
  listarActivos,
  listar,
  crear,
  actualizar,
  eliminar,
} = require('../controllers/anuncioController')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { validarResultados } = require('../middleware/errores')

const router = Router()

router.get('/', listarActivos)

router.get('/todos', requireAuth, requireAdmin, listar)

router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('empresa').trim().notEmpty().withMessage('La empresa es obligatoria'),
    body('tipo').isIn(['imagen', 'video']).withMessage('Tipo debe ser imagen o video'),
    body('contenido').trim().notEmpty().withMessage('La URL del contenido es obligatoria'),
    validarResultados,
  ],
  crear
)

router.put('/:id', requireAuth, requireAdmin, actualizar)

router.delete('/:id', requireAuth, requireAdmin, eliminar)

module.exports = router
