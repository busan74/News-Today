const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')
const { subirArchivo } = require('../controllers/uploadController')

const router = Router()

router.post('/', requireAuth, subirArchivo)

module.exports = router
