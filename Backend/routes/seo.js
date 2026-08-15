const express = require('express')
const { detectarPueblo, obtenerConfig } = require('../config/pueblos')
const { getSupabase } = require('../config/supabase')

const router = express.Router()

const CATEGORIAS = [
  'actualidad',
  'deportes',
  'cultura',
  'politica',
  'sociedad',
  'sucesos',
  'tiempo',
  'empleo',
]

const rutaDeCategoria = (slug) => (slug === 'empleo' ? '/tablon' : `/${slug}`)

const escaparXml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const aIso = (fecha) => {
  if (!fecha) return ''
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString()
}

router.get('/robots.txt', (req, res) => {
  const pueblo = obtenerConfig(detectarPueblo(req))
  const contenido = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /login',
    'Disallow: /administracion',
    'Disallow: /busqueda',
    '',
    `Sitemap: https://${pueblo.dominio}/sitemap.xml`,
    '',
  ].join('\n')
  res.type('text/plain').send(contenido)
})

router.get('/sitemap.xml', async (req, res) => {
  const pueblo = obtenerConfig(detectarPueblo(req))
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('noticias')
    .select('id, categoria, fecha')
    .eq('pueblo', pueblo.slug)
    .order('fecha', { ascending: false })
    .limit(5000)
  if (error) throw error

  const base = `https://${pueblo.dominio}`
  const noticias = data || []

  const urls = [
    { loc: `${base}/`, changefreq: 'daily', priority: '1.0' },
    ...CATEGORIAS.map((slug) => ({
      loc: `${base}${rutaDeCategoria(slug)}`,
      changefreq: 'daily',
      priority: '0.8',
    })),
    ...noticias.map((n) => ({
      loc: `${base}/noticia/${n.id}`,
      lastmod: aIso(n.fecha),
      priority: '0.7',
    })),
  ]

  const lineas = urls.map(
    (u) =>
      `  <url><loc>${escaparXml(u.loc)}</loc>${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`
  )

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...lineas,
    '</urlset>',
  ].join('\n')

  res.type('application/xml').send(xml)
})

module.exports = router
