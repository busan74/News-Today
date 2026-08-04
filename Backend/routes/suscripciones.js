const { Router } = require('express')
const { body } = require('express-validator')
const { suscribir, listar } = require('../controllers/suscripcionController')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { validarResultados } = require('../middleware/errores')

const router = Router()

router.post(
  '/',
  [body('email').isEmail().withMessage('Email inválido'), validarResultados],
  suscribir
)

router.get('/', requireAuth, requireAdmin, listar)

module.exports = router
