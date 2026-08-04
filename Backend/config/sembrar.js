const Categoria = require('../models/Categoria')
const Usuario = require('../models/Usuario')
const Noticia = require('../models/Noticia')
const { config } = require('./env')

const categorias = [
  { slug: 'actualidad', nombre: 'Actualidad' },
  { slug: 'deportes', nombre: 'Deportes' },
  { slug: 'pasatiempos', nombre: 'Pasatiempos' },
  { slug: 'politica', nombre: 'Política' },
  { slug: 'sociedad', nombre: 'Sociedad' },
  { slug: 'sucesos', nombre: 'Sucesos' },
  { slug: 'tiempo', nombre: 'Tiempo' },
  { slug: 'empleo', nombre: 'Empleo' },
]

const noticias = [
  { categoria: 'actualidad', titulo: 'El país se prepara para una nueva ola de calor', texto: 'Las autoridades recomiendan hidratación constante y evitar la exposición al sol en horas pico.', fecha: '2026-08-04T10:00:00.000Z' },
  { categoria: 'actualidad', titulo: 'Ciencia descubre un nuevo método de reciclaje', texto: 'Un equipo de investigadores presentó una técnica revolucionaria para reutilizar plásticos.', fecha: '2026-08-03T12:30:00.000Z' },
  { categoria: 'actualidad', titulo: 'El transporte público renueva su flota', texto: 'Los nuevos vehículos prometen reducir los tiempos de espera y las emisiones contaminantes.', fecha: '2026-08-02T09:15:00.000Z' },
  { categoria: 'deportes', titulo: 'Final del campeonato definida', texto: 'Los dos mejores equipos del torneo se enfrentarán el próximo domingo.', fecha: '2026-08-04T11:00:00.000Z' },
  { categoria: 'deportes', titulo: 'La selección arranca su gira', texto: 'El plantel viaja con la ilusión de sumar nuevos triunfos internacionales.', fecha: '2026-08-03T16:45:00.000Z' },
  { categoria: 'pasatiempos', titulo: 'Libros para el fin de semana', texto: 'Nuestras recomendaciones de lectura para desconectar y disfrutar.', fecha: '2026-08-04T08:00:00.000Z' },
  { categoria: 'pasatiempos', titulo: 'Rutas de senderismo cercanas', texto: 'Descubre los mejores caminos naturales a una hora de la ciudad.', fecha: '2026-08-01T10:30:00.000Z' },
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
]

const sembrarCategorias = async () => {
  if ((await Categoria.countDocuments()) > 0) {
    console.log('[seed] Categorías ya existentes, se omiten.')
    return
  }
  await Categoria.insertMany(categorias)
  console.log('[seed] Categorías creadas:', categorias.length)
}

const sembrarAdmin = async () => {
  const { ADMIN_USER, ADMIN_EMAIL, ADMIN_PASS } = config
  const usuario = await Usuario.findOne({ $or: [{ username: ADMIN_USER }, { email: ADMIN_EMAIL }] }).select('+password')

  if (usuario) {
    const cambios = {}
    if (usuario.role !== 'admin') cambios.role = 'admin'
    if (usuario.username !== ADMIN_USER) cambios.username = ADMIN_USER
    if (usuario.email !== ADMIN_EMAIL) cambios.email = ADMIN_EMAIL
    const pwdOk = await usuario.compararPassword(ADMIN_PASS)
    if (!pwdOk) cambios.password = ADMIN_PASS

    if (Object.keys(cambios).length) {
      Object.assign(usuario, cambios)
      await usuario.save()
      console.log('[seed] Usuario admin actualizado:', ADMIN_EMAIL)
    } else {
      console.log('[seed] Usuario admin ya existe:', ADMIN_EMAIL)
    }
    return
  }

  await Usuario.create({ username: ADMIN_USER, email: ADMIN_EMAIL, password: ADMIN_PASS, role: 'admin' })
  console.log(`[seed] Usuario admin creado: ${ADMIN_USER} / ${ADMIN_EMAIL}`)
}

const sembrarNoticias = async () => {
  if ((await Noticia.countDocuments()) > 0) {
    console.log('[seed] Noticias ya existentes, se omiten.')
    return
  }
  await Noticia.insertMany(
    noticias.map((n, i) => ({ ...n, imagen: `/images/noticia-${i + 1}.jpg` }))
  )
  console.log('[seed] Noticias creadas:', noticias.length)
}

const sembrar = async () => {
  await sembrarCategorias()
  await sembrarAdmin()
  await sembrarNoticias()
}

module.exports = { sembrar }
