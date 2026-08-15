const { detectarPueblo, obtenerConfig } = require('../config/pueblos')
const { getSupabase } = require('../config/supabase')

const ES_BOT =
  /whatsapp|facebookexternalhit|facebot|facebookbot|twitterbot|linkedinbot|slackbot|discordbot|telegram|viber|line\b|pinterest|skypeuripreview|googlebot|bingbot|yandex|baiduspider|duckduckbot|applebot|meta-externalagent|snapchat|tiktok/i

const ES_ARCHIVO = /\.(js|css|json|xml|png|jpg|jpeg|gif|webp|svg|ico|txt|woff2?|mp4|webm|ogg)(\?|#|$)/i
const ES_VIDEO = /\.(mp4|webm|ogv)(\?|#|$)/i

const CATEGORIAS = {
  actualidad: 'Actualidad',
  deportes: 'Deportes',
  cultura: 'Cultura',
  politica: 'Política',
  sociedad: 'Sociedad',
  sucesos: 'Sucesos',
  tiempo: 'Tiempo',
  tablon: 'Tablón',
}

const DESC_CATEGORIA = {
  actualidad: 'Últimas noticias de actualidad, minuto a minuto.',
  deportes: 'Resultados, crónicas y novedades del mundo del deporte.',
  cultura: 'Agenda cultural, arte, exposiciones y más.',
  politica: 'Análisis y noticias del ámbito político.',
  sociedad: 'La actualidad social, cultural y comunitaria.',
  sucesos: 'Información y novedades sobre sucesos y seguridad.',
  tiempo: 'El pronóstico del tiempo para tu día a día.',
  tablon: 'Anuncios, avisos y novedades del municipio.',
}

const NOMBRES_CATEGORIA = {
  actualidad: 'Actualidad',
  deportes: 'Deportes',
  cultura: 'Cultura',
  politica: 'Política',
  sociedad: 'Sociedad',
  sucesos: 'Sucesos',
  tiempo: 'Tiempo',
  empleo: 'Tablón',
}

const categoriaDePagina = (pagina) => (pagina === 'tablon' ? 'empleo' : pagina)

const NOINDEX = ['login', 'administracion', 'busqueda']

const escaparHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const recortar = (texto) => {
  const limpio = String(texto || '').replace(/\s+/g, ' ').trim()
  if (limpio.length <= 300) return limpio
  return `${limpio.slice(0, 299)}…`
}

const fechaCorta = (fecha) => {
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const imagenAbsoluta = (url, base) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${base}${String(url).startsWith('/') ? url : `/${url}`}`
}

const faviconDe = (pueblo) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="${pueblo.color}"/><text x="24" y="31" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#ffffff" text-anchor="middle">${pueblo.logo}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const construirPagina = ({ pueblo, titulo, descripcion, ruta, tipo = 'website', imagen, publicadoEn, seccion, noindex = false, cuerpo }) => {
  const base = `https://${pueblo.dominio}`
  const url = `${base}${ruta}`
  const favicon = faviconDe(pueblo)
  const desc = recortar(descripcion || pueblo.descripcion)
  const tituloFinal =
    titulo && titulo !== pueblo.nombre ? `${titulo} · ${pueblo.nombre}` : titulo || pueblo.nombre

  const etiquetas = [
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `<link rel="icon" type="image/svg+xml" href="${favicon}" />`,
    `<meta name="theme-color" content="${pueblo.color}" />`,
    `<title>${escaparHtml(tituloFinal)}</title>`,
    `<meta name="description" content="${escaparHtml(desc)}" />`,
    `<link rel="canonical" href="${escaparHtml(url)}" />`,
    `<meta property="og:title" content="${escaparHtml(tituloFinal)}" />`,
    `<meta property="og:description" content="${escaparHtml(desc)}" />`,
    `<meta property="og:type" content="${tipo}" />`,
    `<meta property="og:url" content="${escaparHtml(url)}" />`,
    `<meta property="og:site_name" content="${escaparHtml(pueblo.nombre)}" />`,
    '<meta property="og:locale" content="es_ES" />',
  ]

  if (imagen) {
    etiquetas.push(
      `<meta property="og:image" content="${escaparHtml(imagen)}" />`,
      `<meta property="og:image:alt" content="${escaparHtml(tituloFinal)}" />`
    )
  }
  if (tipo === 'article') {
    if (publicadoEn) etiquetas.push(`<meta property="article:published_time" content="${escaparHtml(publicadoEn)}" />`)
    if (seccion) etiquetas.push(`<meta property="article:section" content="${escaparHtml(seccion)}" />`)
  }
  etiquetas.push(
    `<meta name="twitter:card" content="${imagen ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escaparHtml(tituloFinal)}" />`,
    `<meta name="twitter:description" content="${escaparHtml(desc)}" />`
  )
  if (imagen) etiquetas.push(`<meta name="twitter:image" content="${escaparHtml(imagen)}" />`)
  if (noindex) etiquetas.push('<meta name="robots" content="noindex, nofollow" />')

  return [
    '<!doctype html>',
    '<html lang="es">',
    '<head>',
    ...etiquetas.map((t) => `  ${t}`),
    '</head>',
    '<body>',
    '  <main>',
    '    ' + cuerpo,
    '  </main>',
    '  <footer><p>Actualidad Local</p></footer>',
    '</body>',
    '</html>',
  ].join('\n')
}

const listaNoticias = (noticias, base) => {
  if (!noticias || noticias.length === 0) return ''
  const items = noticias
    .map(
      (n) =>
        `      <li><a href="${escaparHtml(`${base}/noticia/${n.id}`)}">${escaparHtml(n.titulo)}</a></li>`
    )
    .join('\n')
  return `    <h2>Últimas noticias</h2>\n    <ul>\n${items}\n    </ul>`
}

const renderPortada = async (req, res, pueblo, base) => {
  const supabase = getSupabase()
  const { data: recientes, error } = await supabase
    .from('noticias')
    .select('id, titulo')
    .eq('pueblo', pueblo.slug)
    .order('fecha', { ascending: false })
    .limit(10)
  if (error) throw error

  const { data: portada } = await supabase
    .from('noticias')
    .select('imagen')
    .eq('pueblo', pueblo.slug)
    .eq('portada', true)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle()

  const imagen = portada?.imagen && !ES_VIDEO.test(portada.imagen) ? imagenAbsoluta(portada.imagen, base) : ''

  const cuerpo = [
    `<h1>${escaparHtml(pueblo.nombre)}</h1>`,
    `<p>${escaparHtml(pueblo.descripcion)}</p>`,
    listaNoticias(recientes, base),
  ].join('\n')

  res.type('text/html').send(
    construirPagina({
      pueblo,
      titulo: pueblo.nombre,
      descripcion: pueblo.descripcion,
      ruta: '/',
      imagen,
      cuerpo,
    })
  )
}

const renderNoticia = async (req, res, pueblo, base, id) => {
  const supabase = getSupabase()
  const { data: noticia, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('pueblo', pueblo.slug)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error

  if (!noticia) {
    res.status(404).type('text/html').send(
      construirPagina({
        pueblo,
        titulo: 'Noticia no encontrada',
        descripcion: 'La noticia que buscas no existe o fue movida.',
        ruta: `/noticia/${id}`,
        noindex: true,
        cuerpo: '<h1>Noticia no encontrada</h1><p>La noticia que buscas no existe o fue movida.</p>',
      })
    )
    return
  }

  const imagen =
    noticia.imagen && !ES_VIDEO.test(noticia.imagen) ? imagenAbsoluta(noticia.imagen, base) : ''

  const cuerpo = [
    noticia.imagen ? `<img src="${escaparHtml(imagenAbsoluta(noticia.imagen, base))}" alt="${escaparHtml(noticia.titulo)}" />` : '',
    `<h1>${escaparHtml(noticia.titulo)}</h1>`,
    noticia.fecha ? `<p><time>${escaparHtml(fechaCorta(noticia.fecha))}</time></p>` : '',
    `<p>${escaparHtml(noticia.texto)}</p>`,
  ].filter(Boolean).join('\n')

  res.type('text/html').send(
    construirPagina({
      pueblo,
      titulo: noticia.titulo,
      descripcion: noticia.texto,
      ruta: `/noticia/${id}`,
      tipo: 'article',
      imagen,
      publicadoEn: noticia.fecha ? new Date(noticia.fecha).toISOString() : undefined,
      seccion: NOMBRES_CATEGORIA[noticia.categoria] || noticia.categoria,
      cuerpo,
    })
  )
}

const renderCategoria = async (req, res, pueblo, base, pagina) => {
  const supabase = getSupabase()
  const categoria = categoriaDePagina(pagina)
  const { data: noticias, error } = await supabase
    .from('noticias')
    .select('id, titulo')
    .eq('pueblo', pueblo.slug)
    .eq('categoria', categoria)
    .order('fecha', { ascending: false })
    .limit(10)
  if (error) throw error

  const cuerpo = [
    `<h1>${escaparHtml(CATEGORIAS[pagina])}</h1>`,
    `<p>${escaparHtml(DESC_CATEGORIA[pagina])}</p>`,
    listaNoticias(noticias, base),
  ].join('\n')

  res.type('text/html').send(
    construirPagina({
      pueblo,
      titulo: CATEGORIAS[pagina],
      descripcion: DESC_CATEGORIA[pagina],
      ruta: `/${pagina}`,
      cuerpo,
    })
  )
}

const renderBasica = (req, res, pueblo, base, pagina) => {
  const titulo = pagina === 'login' ? 'Iniciar sesión' : pagina === 'administracion' ? 'Administración' : 'Buscar noticias'
  const descripcion =
    pagina === 'login'
      ? 'Acceso al panel de administración.'
      : pagina === 'administracion'
        ? 'Panel de administración.'
        : 'Busca noticias por palabra clave y categoría.'
  res.type('text/html').send(
    construirPagina({
      pueblo,
      titulo,
      descripcion,
      ruta: `/${pagina}`,
      noindex: true,
      cuerpo: `<h1>${escaparHtml(titulo)}</h1>`,
    })
  )
}

const responder = async (req, res) => {
  const pueblo = obtenerConfig(detectarPueblo(req))
  const base = `https://${pueblo.dominio}`
  const pagina = req.path.slice(1)

  if (req.path === '/') return renderPortada(req, res, pueblo, base)

  const matchNoticia = req.path.match(/^\/noticia\/([^/]+)\/?$/)
  if (matchNoticia) return renderNoticia(req, res, pueblo, base, matchNoticia[1])

  if (CATEGORIAS[pagina]) return renderCategoria(req, res, pueblo, base, pagina)
  if (NOINDEX.includes(pagina)) return renderBasica(req, res, pueblo, base, pagina)

  res.status(404).type('text/html').send(
    construirPagina({
      pueblo,
      titulo: 'Página no encontrada',
      descripcion: 'La página que buscas no existe o fue movida.',
      ruta: req.path,
      noindex: true,
      cuerpo: '<h1>Página no encontrada</h1><p>La página que buscas no existe o fue movida.</p>',
    })
  )
}

const prerender = async (req, res, next) => {
  const pedidoDeBot =
    req.headers['x-prerender'] === '1' || ES_BOT.test(String(req.headers['user-agent'] || ''))

  if (!pedidoDeBot) return next()
  if (req.path.startsWith('/api/')) return next()
  if (req.path.startsWith('/uploads/')) return next()
  if (ES_ARCHIVO.test(req.path)) return next()

  try {
    await responder(req, res)
  } catch (err) {
    next(err)
  }
}

module.exports = prerender
