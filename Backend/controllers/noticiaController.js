const { getSupabase } = require('../config/supabase')
const { esIdInvalido } = require('../middleware/errores')

const serializarNoticia = (n) => ({
  id: n.id,
  categoria: n.categoria,
  titulo: n.titulo,
  texto: n.texto,
  imagen: n.imagen,
  fecha: n.fecha,
})

const listar = async (req, res) => {
  const { categoria, q } = req.query
  const supabase = getSupabase()

  let query = supabase.from('noticias').select('*').order('fecha', { ascending: false })
  if (categoria) query = query.eq('categoria', categoria)
  if (q) query = query.or(`titulo.ilike.%${q}%,texto.ilike.%${q}%`)

  const { data, error } = await query
  if (error) throw error

  res.json({ success: true, data: (data || []).map(serializarNoticia) })
}

const obtener = async (req, res) => {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle()

  if (error) {
    if (esIdInvalido(error)) {
      return res.status(404).json({ success: false, error: 'Noticia no encontrada' })
    }
    throw error
  }
  if (!data) {
    return res.status(404).json({ success: false, error: 'Noticia no encontrada' })
  }

  res.json({ success: true, data: serializarNoticia(data) })
}

const crear = async (req, res) => {
  const { categoria, titulo, texto, imagen, fecha } = req.body
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('noticias')
    .insert({
      categoria,
      titulo,
      texto,
      imagen: imagen || '',
      fecha: fecha || new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error

  res.status(201).json({ success: true, data: serializarNoticia(data) })
}

const actualizar = async (req, res) => {
  const { categoria, titulo, texto, imagen, fecha } = req.body
  const supabase = getSupabase()

  const cambios = {}
  if (categoria !== undefined) cambios.categoria = categoria
  if (titulo !== undefined) cambios.titulo = titulo
  if (texto !== undefined) cambios.texto = texto
  if (imagen !== undefined) cambios.imagen = imagen
  if (fecha !== undefined) cambios.fecha = fecha

  const { data, error } = await supabase
    .from('noticias')
    .update(cambios)
    .eq('id', req.params.id)
    .select()
    .maybeSingle()

  if (error) {
    if (esIdInvalido(error)) {
      return res.status(404).json({ success: false, error: 'Noticia no encontrada' })
    }
    throw error
  }
  if (!data) {
    return res.status(404).json({ success: false, error: 'Noticia no encontrada' })
  }

  res.json({ success: true, data: serializarNoticia(data) })
}

const eliminar = async (req, res) => {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('noticias')
    .delete()
    .eq('id', req.params.id)
    .select()
    .maybeSingle()

  if (error) {
    if (esIdInvalido(error)) {
      return res.status(404).json({ success: false, error: 'Noticia no encontrada' })
    }
    throw error
  }
  if (!data) {
    return res.status(404).json({ success: false, error: 'Noticia no encontrada' })
  }

  res.json({ success: true, data: serializarNoticia(data) })
}

module.exports = { listar, obtener, crear, actualizar, eliminar }
