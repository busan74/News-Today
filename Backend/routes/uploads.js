const { Router } = require('express')
const { requireAuth, verificarPueblo } = require('../middleware/auth')
const { subirArchivo } = require('../controllers/uploadController')
const { crearLimite } = require('../middleware/rateLimit')

const router = Router()

router.post('/', requireAuth, verificarPueblo, crearLimite({ max: 10 }), subirArchivo)

module.exports = router
