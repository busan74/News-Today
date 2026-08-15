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

describe('SEO: robots.txt y sitemap.xml', () => {
  it('robots.txt apunta al sitemap del pueblo detectado', async () => {
    const res = await request(app)
      .get('/robots.txt')
      .set('Host', 'lascabezas.actualidadlocal.es')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/text\/plain/)
    expect(res.text).toContain('User-agent: *')
    expect(res.text).toContain('Disallow: /login')
    expect(res.text).toContain('Sitemap: https://lascabezas.actualidadlocal.es/sitemap.xml')
  })

  it('robots.txt usa el dominio de cada pueblo', async () => {
    const res = await request(app)
      .get('/robots.txt')
      .set('Host', 'lebrija.actualidadlocal.es')

    expect(res.text).toContain('Sitemap: https://lebrija.actualidadlocal.es/sitemap.xml')
  })

  it('sitemap.xml lista portada, categorías y las noticias del pueblo', async () => {
    const token = await crearAdmin()
    const creada = await request(app)
      .post('/api/noticias')
      .set('Authorization', `Bearer ${token}`)
      .send({ categoria: 'deportes', titulo: 'Final del torneo', texto: 'Gran partido.' })

    const res = await request(app)
      .get('/sitemap.xml')
      .set('Host', 'lascabezas.actualidadlocal.es')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/xml/)
    expect(res.text).toContain('https://lascabezas.actualidadlocal.es/</loc>')
    expect(res.text).toContain('https://lascabezas.actualidadlocal.es/deportes</loc>')
    expect(res.text).toContain('https://lascabezas.actualidadlocal.es/tablon</loc>')
    expect(res.text).toContain(`https://lascabezas.actualidadlocal.es/noticia/${creada.body.data.id}`)
  })

  it('sitemap.xml solo incluye noticias de su propio pueblo', async () => {
    const token = await crearAdmin()
    await request(app)
      .post('/api/noticias')
      .set('Authorization', `Bearer ${token}`)
      .send({ categoria: 'deportes', titulo: 'Noticia de Las Cabezas', texto: 'Texto.' })

    const res = await request(app)
      .get('/sitemap.xml')
      .set('Host', 'lebrija.actualidadlocal.es')

    expect(res.text).toContain('https://lebrija.actualidadlocal.es/</loc>')
    expect(res.text).not.toContain('Noticia de Las Cabezas')
    expect(res.text).not.toContain('lascabezas.actualidadlocal.es/noticia/')
  })
})
