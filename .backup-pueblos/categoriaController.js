const { getSupabase } = require('../config/supabase')
const { esIdInvalido } = require('../middleware/errores')

const serializarCategoria = (c) => ({ id: c.id, slug: c.slug, nombre: c.nombre })

const listar = async (req, res) => {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('categorias').select('*').order('nombre', { ascending: true })
  if (error) throw error

  res.json({ success: true, data: (data || []).map(serializarCategoria) })
}

const crear = async (req, res) => {
  const { slug, nombre } = req.body
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('categorias')
    .insert({ slug, nombre })
    .select()
    .single()
  if (error) throw error

  res.status(201).json({ success: true, data: serializarCategoria(data) })
}

const actualizar = async (req, res) => {
  const { slug, nombre } = req.body
  const supabase = getSupabase()

  const cambios = {}
  if (slug !== undefined) cambios.slug = slug
  if (nombre !== undefined) cambios.nombre = nombre

  const { data, error } = await supabase
    .from('categorias')
    .update(cambios)
    .eq('id', req.params.id)
    .select()
    .maybeSingle()

  if (error) {
    if (esIdInvalido(error)) {
      return res.status(404).json({ success: false, error: 'Categoría no encontrada' })
    }
    throw error
  }
  if (!data) {
    return res.status(404).json({ success: false, error: 'Categoría no encontrada' })
  }

  res.json({ success: true, data: serializarCategoria(data) })
}

const eliminar = async (req, res) => {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', req.params.id)
    .select()
    .maybeSingle()

  if (error) {
    if (esIdInvalido(error)) {
      return res.status(404).json({ success: false, error: 'Categoría no encontrada' })
    }
    throw error
  }
  if (!data) {
    return res.status(404).json({ success: false, error: 'Categoría no encontrada' })
  }

  res.json({ success: true, data: serializarCategoria(data) })
}

module.exports = { listar, crear, actualizar, eliminar }
