import request from 'supertest'
import app from '../app'

const crearAdmin = async () => {
  const res = await request(app).post('/api/auth/register').send({
    username: 'admin',
    email: 'admin@news-today.local',
    password: 'password123',
  })
  return res.body.token
}

const crearNoticia = async (token, extra = {}) => {
  const res = await request(app)
    .post('/api/noticias')
    .set('Authorization', `Bearer ${token}`)
    .send({
      categoria: 'deportes',
      titulo: 'Final del torneo',
      texto: 'Gran partido decidido en la prórroga.',
      imagen: '/images/noticia-1.jpg',
      ...extra,
    })
  return res.body.data
}

describe('Prerender para crawlers', () => {
  it('una noticia con user-agent de bot devuelve HTML con og: e imagen absoluta', async () => {
    const token = await crearAdmin()
    const noticia = await crearNoticia(token)

    const res = await request(app)
      .get(`/noticia/${noticia.id}`)
      .set('User-Agent', 'WhatsApp/2.23.20.0')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/text\/html/)
    expect(res.text).toContain('<title>Final del torneo · Actualidad Las Cabezas</title>')
    expect(res.text).toContain('og:title')
    expect(res.text).toContain('og:type" content="article"')
    expect(res.text).toContain('https://lascabezas.actualidadlocal.es/images/noticia-1.jpg')
    expect(res.text).toContain(`https://lascabezas.actualidadlocal.es/noticia/${noticia.id}`)
    expect(res.text).toContain('article:published_time')
    expect(res.text).toContain('article:section')
    expect(res.text).toContain('<h1>Final del torneo</h1>')
    expect(res.text).toContain('Gran partido decidido en la prórroga.')
    expect(res.text).not.toContain('<div id="root">')
  })

  it('una petición sin user-agent de bot no devuelve prerender', async () => {
    const token = await crearAdmin()
    const noticia = await crearNoticia(token)

    const res = await request(app).get(`/noticia/${noticia.id}`)

    expect(res.status).toBe(404)
    expect(res.headers['content-type']).toMatch(/json/)
  })

  it('la portada con bot devuelve HTML del pueblo', async () => {
    await crearAdmin()
    const res = await request(app)
      .get('/')
      .set('X-Prerender', '1')

    expect(res.status).toBe(200)
    expect(res.text).toContain('Actualidad Las Cabezas')
    expect(res.text).toContain('og:type" content="website"')
    expect(res.text).toContain('rel="canonical" href="https://lascabezas.actualidadlocal.es/"')
  })

  it('las páginas de gestión se marcan como noindex', async () => {
    const res = await request(app)
      .get('/login')
      .set('User-Agent', 'Twitterbot/1.0')

    expect(res.status).toBe(200)
    expect(res.text).toContain('noindex, nofollow')
    expect(res.text).toContain('<title>Iniciar sesión · Actualidad Las Cabezas</title>')
  })

  it('una ruta desconocida con bot devuelve 404 en HTML', async () => {
    const res = await request(app)
      .get('/ruta-inventada')
      .set('User-Agent', 'Googlebot/2.1')

    expect(res.status).toBe(404)
    expect(res.headers['content-type']).toMatch(/text\/html/)
    expect(res.text).toContain('Página no encontrada')
  })
})
