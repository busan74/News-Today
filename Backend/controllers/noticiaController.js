const { getSupabase } = require('../config/supabase')
const { esIdInvalido } = require('../middleware/errores')
const { detectarPueblo } = require('../config/pueblos')

const serializarNoticia = (n) => ({
  id: n.id,
  categoria: n.categoria,
  titulo: n.titulo,
  texto: n.texto,
  imagen: n.imagen,
  fecha: n.fecha,
  portada: Boolean(n.portada),
  pueblo: n.pueblo,
})

const listar = async (req, res) => {
  const { categoria, q } = req.query
  const pueblo = detectarPueblo(req)
  const supabase = getSupabase()

  let query = supabase.from('noticias').select('*').eq('pueblo', pueblo).order('fecha', { ascending: false })
  if (categoria) query = query.eq('categoria', categoria)
  if (q) {
    const termino = String(q).replace(/"/g, '""')
    query = query.or(`titulo.ilike."%${termino}%",texto.ilike."%${termino}%"`)
  }

  const { data, error } = await query
  if (error) throw error

  res.json({ success: true, data: (data || []).map(serializarNoticia) })
}

const obtenerPortada = async (req, res) => {
  const pueblo = detectarPueblo(req)
  const supabase = getSupabase()

  let { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('pueblo', pueblo)
    .eq('portada', true)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error

  if (!data) {
    const fallback = await supabase
      .from('noticias')
      .select('*')
      .eq('pueblo', pueblo)
      .order('fecha', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (fallback.error) throw fallback.error
    data = fallback.data
  }

  if (!data) {
    return res.status(404).json({ success: false, error: 'No hay noticias todavía' })
  }

  res.json({ success: true, data: serializarNoticia(data) })
}

const obtener = async (req, res) => {
  const pueblo = detectarPueblo(req)
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', req.params.id)
    .eq('pueblo', pueblo)
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
  const { categoria, titulo, texto, imagen, fecha, portada } = req.body
  const pueblo = detectarPueblo(req)
  const supabase = getSupabase()

  if (portada) {
    const { error } = await supabase
      .from('noticias')
      .update({ portada: false })
      .eq('pueblo', pueblo)
    if (error) throw error
  }

  const { data, error } = await supabase
    .from('noticias')
    .insert({
      categoria,
      titulo,
      texto,
      imagen: imagen || '',
      fecha: fecha || new Date().toISOString(),
      portada: Boolean(portada),
      pueblo,
    })
    .select()
    .single()
  if (error) throw error

  res.status(201).json({ success: true, data: serializarNoticia(data) })
}

const actualizar = async (req, res) => {
  const { categoria, titulo, texto, imagen, fecha, portada } = req.body
  const pueblo = detectarPueblo(req)
  const supabase = getSupabase()

  const cambios = {}
  if (categoria !== undefined) cambios.categoria = categoria
  if (titulo !== undefined) cambios.titulo = titulo
  if (texto !== undefined) cambios.texto = texto
  if (imagen !== undefined) cambios.imagen = imagen
  if (fecha !== undefined) cambios.fecha = fecha
  if (portada !== undefined) {
    if (portada) {
      const { error } = await supabase
        .from('noticias')
        .update({ portada: false })
        .eq('pueblo', pueblo)
        .neq('id', req.params.id)
      if (error) throw error
    }
    cambios.portada = Boolean(portada)
  }

  const { data, error } = await supabase
    .from('noticias')
    .update(cambios)
    .eq('id', req.params.id)
    .eq('pueblo', pueblo)
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
  const pueblo = detectarPueblo(req)
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('noticias')
    .delete()
    .eq('id', req.params.id)
    .eq('pueblo', pueblo)
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

module.exports = { listar, obtenerPortada, obtener, crear, actualizar, eliminar }
