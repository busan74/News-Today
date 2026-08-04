const Categoria = require('../models/Categoria')

const listar = async (req, res) => {
  const categorias = await Categoria.find().sort({ nombre: 1 })
  res.json({ success: true, data: categorias })
}

const crear = async (req, res) => {
  const { slug, nombre } = req.body
  const categoria = await Categoria.create({ slug, nombre })
  res.status(201).json({ success: true, data: categoria })
}

const actualizar = async (req, res) => {
  const { slug, nombre } = req.body
  const categoria = await Categoria.findByIdAndUpdate(
    req.params.id,
    { slug, nombre },
    { returnDocument: 'after', runValidators: true }
  )
  if (!categoria) {
    return res.status(404).json({ success: false, error: 'Categoría no encontrada' })
  }
  res.json({ success: true, data: categoria })
}

const eliminar = async (req, res) => {
  const categoria = await Categoria.findByIdAndDelete(req.params.id)
  if (!categoria) {
    return res.status(404).json({ success: false, error: 'Categoría no encontrada' })
  }
  res.json({ success: true, data: categoria })
}

module.exports = { listar, crear, actualizar, eliminar }
