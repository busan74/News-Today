const Noticia = require('../models/Noticia')

const listar = async (req, res) => {
  const { categoria, q } = req.query
  const filtro = {}
  if (categoria) filtro.categoria = categoria
  if (q) {
    const termino = new RegExp(q, 'i')
    filtro.$or = [{ titulo: termino }, { texto: termino }]
  }
  const noticias = await Noticia.find(filtro).sort({ fecha: -1 })
  res.json({ success: true, data: noticias })
}

const obtener = async (req, res) => {
  const noticia = await Noticia.findById(req.params.id)
  if (!noticia) {
    return res.status(404).json({ success: false, error: 'Noticia no encontrada' })
  }
  res.json({ success: true, data: noticia })
}

const crear = async (req, res) => {
  const { categoria, titulo, texto, imagen, fecha } = req.body
  const noticia = await Noticia.create({ categoria, titulo, texto, imagen, fecha })
  res.status(201).json({ success: true, data: noticia })
}

const actualizar = async (req, res) => {
  const { categoria, titulo, texto, imagen, fecha } = req.body
  const noticia = await Noticia.findByIdAndUpdate(
    req.params.id,
    { categoria, titulo, texto, imagen, fecha },
    { returnDocument: 'after', runValidators: true }
  )
  if (!noticia) {
    return res.status(404).json({ success: false, error: 'Noticia no encontrada' })
  }
  res.json({ success: true, data: noticia })
}

const eliminar = async (req, res) => {
  const noticia = await Noticia.findByIdAndDelete(req.params.id)
  if (!noticia) {
    return res.status(404).json({ success: false, error: 'Noticia no encontrada' })
  }
  res.json({ success: true, data: noticia })
}

module.exports = { listar, obtener, crear, actualizar, eliminar }
