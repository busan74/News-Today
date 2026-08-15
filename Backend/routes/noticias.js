const { Router } = require('express')
const { body } = require('express-validator')
const { listar, obtenerPortada, obtener, crear, actualizar, eliminar } = require('../controllers/noticiaController')
const { requireAuth, requireAdmin, verificarPueblo } = require('../middleware/auth')
const { validarResultados } = require('../middleware/errores')

const router = Router()

router.get('/', listar)
router.get('/portada', obtenerPortada)
router.get('/:id', obtener)

router.post(
  '/',
  requireAuth,
  verificarPueblo,
  [
    body('categoria').trim().notEmpty().withMessage('La categoría es obligatoria'),
    body('titulo').trim().notEmpty().withMessage('El título es obligatorio'),
    body('texto').trim().notEmpty().withMessage('El texto es obligatorio'),
    validarResultados,
  ],
  crear
)

router.put('/:id', requireAuth, verificarPueblo, actualizar)

// Borrar noticias queda reservado al administrador.
router.delete('/:id', requireAuth, requireAdmin, verificarPueblo, eliminar)

module.exports = router
