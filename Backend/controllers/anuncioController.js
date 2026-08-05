const { getSupabase } = require('../config/supabase')

const serializarAnuncio = (a) => ({
  id: a.id,
  empresa: a.empresa,
  tipo: a.tipo,
  contenido: a.contenido,
  enlace: a.enlace || '',
  activo: a.activo,
  fechaInicio: a.fecha_inicio || null,
  fechaFin: a.fecha_fin || null,
  stripeCustomerId: a.stripe_customer_id || '',
  stripeSubscriptionId: a.stripe_subscription_id || '',
})

const AHORA = () => new Date().toISOString()

const listarActivos = async (_req, res) => {
  const supabase = getSupabase()
  const ahora = AHORA()
  const { data, error } = await supabase
    .from('anuncios')
    .select('*')
    .eq('activo', true)
    .or(`fecha_inicio.is.null,fecha_inicio.lte.${ahora}`)
    .or(`fecha_fin.is.null,fecha_fin.gte.${ahora}`)
    .order('created_at', { ascending: false })
  if (error) throw error

  res.json({ success: true, data: (data || []).map(serializarAnuncio) })
}

const listar = async (_req, res) => {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('anuncios')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error

  res.json({ success: true, data: (data || []).map(serializarAnuncio) })
}

const crear = async (req, res) => {
  const { empresa, tipo = 'imagen', contenido, enlace = '', activo = false, fecha_inicio = null, fecha_fin = null } = req.body
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('anuncios')
    .insert({ empresa, tipo, contenido, enlace, activo, fecha_inicio, fecha_fin })
    .select()
    .single()
  if (error) throw error

  res.status(201).json({ success: true, data: serializarAnuncio(data) })
}

const actualizar = async (req, res) => {
  const { id } = req.params
  const { empresa, tipo, contenido, enlace, activo, fecha_inicio, fecha_fin } = req.body
  const supabase = getSupabase()

  const campos = {}
  if (empresa !== undefined) campos.empresa = empresa
  if (tipo !== undefined) campos.tipo = tipo
  if (contenido !== undefined) campos.contenido = contenido
  if (enlace !== undefined) campos.enlace = enlace
  if (activo !== undefined) campos.activo = activo
  if (fecha_inicio !== undefined) campos.fecha_inicio = fecha_inicio
  if (fecha_fin !== undefined) campos.fecha_fin = fecha_fin

  const { data, error } = await supabase
    .from('anuncios')
    .update(campos)
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw error
  if (!data) {
    return res.status(404).json({ success: false, error: 'Anuncio no encontrado' })
  }

  res.json({ success: true, data: serializarAnuncio(data) })
}

const eliminar = async (req, res) => {
  const { id } = req.params
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('anuncios')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw error
  if (!data) {
    return res.status(404).json({ success: false, error: 'Anuncio no encontrado' })
  }

  res.json({ success: true, data: serializarAnuncio(data) })
}

module.exports = { listarActivos, listar, crear, actualizar, eliminar }
