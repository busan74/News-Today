const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
const MAX_IMAGEN = 10 * 1024 * 1024
const MAX_VIDEO = 50 * 1024 * 1024

const tiposPermitidos = {
  'image/jpeg': { ext: '.jpg', max: MAX_IMAGEN, carpeta: 'images' },
  'image/png': { ext: '.png', max: MAX_IMAGEN, carpeta: 'images' },
  'image/webp': { ext: '.webp', max: MAX_IMAGEN, carpeta: 'images' },
  'image/gif': { ext: '.gif', max: MAX_IMAGEN, carpeta: 'images' },
  'video/mp4': { ext: '.mp4', max: MAX_VIDEO, carpeta: 'videos' },
  'video/webm': { ext: '.webm', max: MAX_VIDEO, carpeta: 'videos' },
  'video/ogg': { ext: '.ogv', max: MAX_VIDEO, carpeta: 'videos' },
}

const subirArchivo = async (req, res) => {
  const { archivo } = req.body

  if (typeof archivo !== 'string') {
    return res.status(400).json({ success: false, error: 'Falta el archivo' })
  }

  const m = archivo.match(/^data:([^;]+);base64,(.+)$/)
  if (!m) {
    return res.status(400).json({ success: false, error: 'El archivo debe ser una imagen o un video válido' })
  }

  const mime = m[1].toLowerCase()
  const tipo = tiposPermitidos[mime]
  if (!tipo) {
    return res.status(400).json({ success: false, error: 'Tipo de archivo no permitido (jpg, png, webp, gif, mp4 o webm)' })
  }

  const contenido = Buffer.from(m[2], 'base64')
  if (contenido.length === 0) {
    return res.status(400).json({ success: false, error: 'El archivo está vacío' })
  }
  if (contenido.length > tipo.max) {
    const mb = tipo.max / (1024 * 1024)
    return res.status(400).json({ success: false, error: `El archivo supera ${mb} MB` })
  }

  const nombre = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${tipo.ext}`
  const dir = path.join(UPLOAD_DIR, tipo.carpeta)
  await fs.promises.mkdir(dir, { recursive: true })
  await fs.promises.writeFile(path.join(dir, nombre), contenido)

  res.status(201).json({ success: true, url: `/uploads/${tipo.carpeta}/${nombre}` })
}

module.exports = { subirArchivo }
