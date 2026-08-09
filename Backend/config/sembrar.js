const { getSupabase } = require('./supabase')
const { config } = require('./env')

const categorias = [
  { slug: 'actualidad', nombre: 'Actualidad' },
  { slug: 'deportes', nombre: 'Deportes' },
  { slug: 'cultura', nombre: 'Cultura' },
  { slug: 'politica', nombre: 'Política' },
  { slug: 'sociedad', nombre: 'Sociedad' },
  { slug: 'sucesos', nombre: 'Sucesos' },
  { slug: 'tiempo', nombre: 'Tiempo' },
  { slug: 'empleo', nombre: 'Tablón' },
]

const noticias = [
  { categoria: 'actualidad', titulo: 'El país se prepara para una nueva ola de calor', texto: 'Las autoridades recomiendan hidratación constante y evitar la exposición al sol en horas pico.', fecha: '2026-08-04T10:00:00.000Z' },
  { categoria: 'actualidad', titulo: 'Ciencia descubre un nuevo método de reciclaje', texto: 'Un equipo de investigadores presentó una técnica revolucionaria para reutilizar plásticos.', fecha: '2026-08-03T12:30:00.000Z' },
  { categoria: 'actualidad', titulo: 'El transporte público renueva su flota', texto: 'Los nuevos vehículos prometen reducir los tiempos de espera y las emisiones contaminantes.', fecha: '2026-08-02T09:15:00.000Z' },
  { categoria: 'deportes', titulo: 'Final del campeonato definida', texto: 'Los dos mejores equipos del torneo se enfrentarán el próximo domingo.', fecha: '2026-08-04T11:00:00.000Z' },
  { categoria: 'deportes', titulo: 'La selección arranca su gira', texto: 'El plantel viaja con la ilusión de sumar nuevos triunfos internacionales.', fecha: '2026-08-03T16:45:00.000Z' },
  { categoria: 'cultura', titulo: 'Libros para el fin de semana', texto: 'Nuestras recomendaciones de lectura para desconectar y disfrutar.', fecha: '2026-08-04T08:00:00.000Z' },
  { categoria: 'cultura', titulo: 'Rutas de senderismo cercanas', texto: 'Descubre los mejores caminos naturales a una hora de la ciudad.', fecha: '2026-08-01T10:30:00.000Z' },
  { categoria: 'cultura', titulo: 'Exposición de pintura en el centro cultural', texto: 'La muestra reúne obras de artistas locales y estará abierta todo el mes.', fecha: '2026-08-05T12:00:00.000Z' },
  { categoria: 'politica', titulo: 'Nuevo proyecto de ley en debate', texto: 'El parlamento discute una reforma clave para la economía del país.', fecha: '2026-08-04T09:30:00.000Z' },
  { categoria: 'politica', titulo: 'Elecciones municipales a la vista', texto: 'Los partidos comienzan a presentar sus candidaturas oficiales.', fecha: '2026-08-02T14:00:00.000Z' },
  { categoria: 'sociedad', titulo: 'Un festival une a los barrios', texto: 'Miles de vecinos participaron en la gran fiesta comunitaria anual.', fecha: '2026-08-03T18:20:00.000Z' },
  { categoria: 'sociedad', titulo: 'Voluntariado: crece la solidaridad', texto: 'Más jóvenes se suman a las iniciativas de ayuda social de la ciudad.', fecha: '2026-08-01T11:10:00.000Z' },
  { categoria: 'sucesos', titulo: 'Rescatan a tres personas en la sierra', texto: 'Bomberos y policía trabajaron durante la noche en el operativo.', fecha: '2026-08-04T07:40:00.000Z' },
  { categoria: 'sucesos', titulo: 'Campaña contra el robo de vehículos', texto: 'Las autoridades anuncian más controles en los accesos a la ciudad.', fecha: '2026-08-02T13:25:00.000Z' },
  { categoria: 'tiempo', titulo: 'Pronóstico de la semana', texto: 'Se esperan días soleados con alguna probabilidad de lluvia el jueves.', fecha: '2026-08-04T06:00:00.000Z' },
  { categoria: 'tiempo', titulo: 'Aviso por tormentas en la costa', texto: 'Protección civil pide precaución en zonas litorales durante el fin de semana.', fecha: '2026-08-03T15:50:00.000Z' },
  { categoria: 'empleo', titulo: 'Crece la oferta de empleo tecnológico', texto: 'Las empresas buscan desarrolladores y perfiles digitales con urgencia.', fecha: '2026-08-04T12:10:00.000Z' },
  { categoria: 'empleo', titulo: 'Ferias de empleo en toda la región', texto: 'Revisa el calendario de eventos para conectar con reclutadores.', fecha: '2026-08-01T09:45:00.000Z' },
  { categoria: 'actualidad', titulo: 'Nuevo enlace a la AP-4 para conectar el municipio', texto: 'Ya está operativo el nuevo enlace a la autovía AP-4, que mejora la conexión del municipio con Sevilla y Cádiz. El acceso reduce los tiempos de desplazamiento y descongestiona el tráfico por el casco urbano.', fecha: '2026-08-06T09:00:00.000Z', portada: true },
]

const anuncios = [
  {
    empresa: 'Cafetería El Rincón',
    tipo: 'imagen',
    contenido: 'https://picsum.photos/seed/rincon/1200/300',
    enlace: 'https://example.com/el-rincon',
    activo: true,
  },
  {
    empresa: 'Gimnasio Vital',
    tipo: 'video',
    contenido: 'https://www.w3schools.com/html/mov_bbb.mp4',
    enlace: 'https://example.com/gimnasio-vital',
    activo: true,
  },
  {
    empresa: 'Ferretería La Llave',
    tipo: 'imagen',
    contenido: 'https://picsum.photos/seed/llave/1200/300',
    enlace: 'https://example.com/ferreteria',
    activo: true,
  },
  {
    empresa: 'Panadería San Juan',
    tipo: 'imagen',
    contenido: 'https://picsum.photos/seed/panaderia/1200/300',
    enlace: 'https://example.com/panaderia',
    activo: true,
  },
]

const contar = async (supabase, tabla, pueblo) => {
  const query = supabase.from(tabla).select('id', { count: 'exact', head: true })
  if (pueblo) query.eq('pueblo', pueblo)
  const { count, error } = await query
  if (error) throw error
  return count || 0
}

const sembrarCategorias = async (supabase, pueblo) => {
  if ((await contar(supabase, 'categorias', pueblo)) > 0) {
    console.log(`[seed] Categorías de ${pueblo} ya existentes, se omiten.`)
    return
  }
  const { error } = await supabase.from('categorias').insert(
    categorias.map((c) => ({ ...c, pueblo }))
  )
  if (error) throw error
  console.log(`[seed] Categorías creadas (${pueblo}):`, categorias.length)
}

const sembrarAdmin = async (supabase) => {
  const { ADMIN_USER, ADMIN_EMAIL, ADMIN_PASS } = config

  const { data: existente } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.eq.${ADMIN_USER},email.eq.${ADMIN_EMAIL}`)
    .maybeSingle()

  if (existente) {
    if (existente.role !== 'admin') {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', existente.id)
      if (error) throw error
      console.log('[seed] Usuario admin actualizado:', ADMIN_EMAIL)
    } else {
      console.log('[seed] Usuario admin ya existe:', ADMIN_EMAIL)
    }
    return
  }

  const { data: creado, error: errorAuth } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
    email_confirm: true,
    user_metadata: { username: ADMIN_USER, role: 'admin' },
  })

  if (errorAuth) {
    const { data: usuarios } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const encontrado = usuarios?.users?.find((u) => u.email === ADMIN_EMAIL)
    if (encontrado) {
      const { error } = await supabase
        .from('profiles')
        .insert({ id: encontrado.id, username: ADMIN_USER, email: ADMIN_EMAIL, role: 'admin' })
      if (error && error.code !== '23505') throw error
      console.log('[seed] Usuario admin enlazado a perfil:', ADMIN_EMAIL)
      return
    }
    throw errorAuth
  }

  const { error } = await supabase
    .from('profiles')
    .insert({ id: creado.user.id, username: ADMIN_USER, email: ADMIN_EMAIL, role: 'admin' })
  if (error) throw error
  console.log(`[seed] Usuario admin creado: ${ADMIN_USER} / ${ADMIN_EMAIL}`)
}

const sembrarNoticias = async (supabase, pueblo) => {
  const { data: existentes, error: errorListado } = await supabase
    .from('noticias')
    .select('titulo')
    .eq('pueblo', pueblo)
  if (errorListado) throw errorListado

  const titulosExistentes = new Set((existentes || []).map((n) => n.titulo))
  let creadas = 0

  for (const [i, n] of noticias.entries()) {
    if (titulosExistentes.has(n.titulo)) continue
    const { error } = await supabase.from('noticias').insert({
      ...n,
      pueblo,
      imagen: `/images/noticia-${i + 1}.jpg`,
    })
    if (error) throw error
    creadas++
  }

  const portada = noticias.find((n) => n.portada)
  if (portada && !titulosExistentes.has(portada.titulo)) {
    const { error: errorDesmarcar } = await supabase
      .from('noticias')
      .update({ portada: false })
      .eq('pueblo', pueblo)
    if (errorDesmarcar) throw errorDesmarcar

    const { error: errorMarcar } = await supabase
      .from('noticias')
      .update({ portada: true })
      .eq('pueblo', pueblo)
      .eq('titulo', portada.titulo)
    if (errorMarcar) throw errorMarcar
  }

  console.log(
    `[seed] Noticias de ${pueblo}: ${titulosExistentes.size + creadas} en total, ${creadas} creadas.`
  )
}

const sembrarAnuncios = async (supabase, pueblo) => {
  const { data: existentes, error: errorListado } = await supabase
    .from('anuncios')
    .select('empresa')
    .eq('pueblo', pueblo)
  if (errorListado) throw errorListado

  const empresasExistentes = new Set((existentes || []).map((a) => a.empresa))
  let creados = 0

  for (const a of anuncios) {
    if (empresasExistentes.has(a.empresa)) continue
    const { error } = await supabase.from('anuncios').insert({ ...a, pueblo })
    if (error) throw error
    creados++
  }

  console.log(
    `[seed] Anuncios de ${pueblo}: ${empresasExistentes.size + creados} en total, ${creados} creados.`
  )
}

const PUEBLOS_SEED = ['lascabezas', 'lebrija', 'elcuervo']

const sembrar = async () => {
  const supabase = getSupabase()
  await sembrarAdmin(supabase)
  for (const pueblo of PUEBLOS_SEED) {
    await sembrarCategorias(supabase, pueblo)
    await sembrarNoticias(supabase, pueblo)
    await sembrarAnuncios(supabase, pueblo)
  }
}

module.exports = { sembrar }
