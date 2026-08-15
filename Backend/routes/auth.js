const { Router } = require('express')
const { body } = require('express-validator')
const { registrar, iniciarSesion, perfil } = require('../controllers/authController')
const { requireAuth, leerUsuario } = require('../middleware/auth')
const { validarResultados } = require('../middleware/errores')
const { crearLimite } = require('../middleware/rateLimit')

const router = Router()

router.post(
  '/register',
  leerUsuario,
  crearLimite({ max: 5, mensaje: 'Demasiados registros desde esta IP. Inténtalo de nuevo en un minuto.' }),
  [
    body('username').trim().isLength({ min: 3 }).withMessage('El usuario debe tener al menos 3 caracteres'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    validarResultados,
  ],
  registrar
)

router.post(
  '/login',
  crearLimite({ max: 5, mensaje: 'Demasiados intentos de acceso. Inténtalo de nuevo en un minuto.' }),
  [
    body('username').trim().notEmpty().withMessage('El usuario o email es obligatorio'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    validarResultados,
  ],
  iniciarSesion
)

router.get('/me', requireAuth, perfil)

module.exports = router
