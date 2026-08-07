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

describe('Noticias', () => {
  it('lista las noticias', async () => {
    const token = await crearAdmin()
    await request(app)
      .post('/api/noticias')
      .set('Authorization', `Bearer ${token}`)
      .send({ categoria: 'deportes', titulo: 'Final definida', texto: 'Dos equipos finalistas.' })

    const res = await request(app).get('/api/noticias')
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(1)
    expect(res.body.data[0]).toHaveProperty('id')
  })

  it('filtra por categoría y por texto', async () => {
    const token = await crearAdmin()
    await request(app)
      .post('/api/noticias')
      .set('Authorization', `Bearer ${token}`)
      .send({ categoria: 'deportes', titulo: 'Final del torneo', texto: 'Gran partido.' })
    await request(app)
      .post('/api/noticias')
      .set('Authorization', `Bearer ${token}`)
      .send({ categoria: 'tiempo', titulo: 'Lluvias en la costa', texto: 'Alertas activas.' })

    const porCategoria = await request(app).get('/api/noticias?categoria=deportes')
    expect(porCategoria.body.data).toHaveLength(1)
    expect(porCategoria.body.data[0].titulo).toBe('Final del torneo')

    const porTexto = await request(app).get('/api/noticias?q=lluvias')
    expect(porTexto.body.data).toHaveLength(1)
    expect(porTexto.body.data[0].titulo).toBe('Lluvias en la costa')
  })

  it('obtiene una noticia por id', async () => {
    const token = await crearAdmin()
    const creada = await request(app)
      .post('/api/noticias')
      .set('Authorization', `Bearer ${token}`)
      .send({ categoria: 'sociedad', titulo: 'Festival', texto: 'Gran fiesta comunitaria.' })

    const res = await request(app).get(`/api/noticias/${creada.body.data.id}`)
    expect(res.status).toBe(200)
    expect(res.body.data.titulo).toBe('Festival')
  })

  it('devuelve 404 para una noticia inexistente', async () => {
    const res = await request(app).get('/api/noticias/507f1f77bcf86cd799439011')
    expect(res.status).toBe(404)
  })

  describe('portada', () => {
    it('devuelve la noticia marcada como portada', async () => {
      const token = await crearAdmin()
      await request(app)
        .post('/api/noticias')
        .set('Authorization', `Bearer ${token}`)
        .send({ categoria: 'actualidad', titulo: 'Nuevo enlace a la AP-4', texto: 'Obras finalizadas.', portada: true })
      await request(app)
        .post('/api/noticias')
        .set('Authorization', `Bearer ${token}`)
        .send({ categoria: 'deportes', titulo: 'Final definida', texto: 'Gran partido.' })

      const res = await request(app).get('/api/noticias/portada')
      expect(res.status).toBe(200)
      expect(res.body.data.titulo).toBe('Nuevo enlace a la AP-4')
      expect(res.body.data.portada).toBe(true)
    })

    it('solo hay una portada: marcar otra la quita de la anterior', async () => {
      const token = await crearAdmin()
      const primera = await request(app)
        .post('/api/noticias')
        .set('Authorization', `Bearer ${token}`)
        .send({ categoria: 'actualidad', titulo: 'Portada A', texto: 'Texto', portada: true })
      const segunda = await request(app)
        .post('/api/noticias')
        .set('Authorization', `Bearer ${token}`)
        .send({ categoria: 'actualidad', titulo: 'Portada B', texto: 'Texto', portada: true })

      const portada1 = await request(app).get('/api/noticias/portada')
      expect(portada1.body.data.id).toBe(segunda.body.data.id)

      await request(app)
        .put(`/api/noticias/${primera.body.data.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ portada: true })

      const portada2 = await request(app).get('/api/noticias/portada')
      expect(portada2.body.data.id).toBe(primera.body.data.id)
    })

    it('si no hay portada marcada usa la noticia más reciente', async () => {
      const token = await crearAdmin()
      await request(app)
        .post('/api/noticias')
        .set('Authorization', `Bearer ${token}`)
        .send({ categoria: 'tiempo', titulo: 'Reciente', texto: 'Última hora.' })

      const res = await request(app).get('/api/noticias/portada')
      expect(res.status).toBe(200)
      expect(res.body.data.titulo).toBe('Reciente')
    })
  })

  describe('rutas protegidas', () => {
    it('rechaza crear sin token', async () => {
      const res = await request(app)
        .post('/api/noticias')
        .send({ categoria: 'deportes', titulo: 'T', texto: 'Texto' })
      expect(res.status).toBe(401)
    })

    it('crea, actualiza y elimina con token', async () => {
      const token = await crearAdmin()

      const creada = await request(app)
        .post('/api/noticias')
        .set('Authorization', `Bearer ${token}`)
        .send({ categoria: 'deportes', titulo: 'Título inicial', texto: 'Texto inicial', imagen: '/images/noticia-1.jpg' })
      expect(creada.status).toBe(201)
      expect(creada.body.data.imagen).toBe('/images/noticia-1.jpg')

      const actualizada = await request(app)
        .put(`/api/noticias/${creada.body.data.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ categoria: 'deportes', titulo: 'Título nuevo', texto: 'Texto nuevo' })
      expect(actualizada.status).toBe(200)
      expect(actualizada.body.data.titulo).toBe('Título nuevo')

      const eliminada = await request(app)
        .delete(`/api/noticias/${creada.body.data.id}`)
        .set('Authorization', `Bearer ${token}`)
      expect(eliminada.status).toBe(200)

      const yaNoExiste = await request(app).get(`/api/noticias/${creada.body.data.id}`)
      expect(yaNoExiste.status).toBe(404)
    })

    it('valida campos obligatorios al crear', async () => {
      const token = await crearAdmin()
      const res = await request(app)
        .post('/api/noticias')
        .set('Authorization', `Bearer ${token}`)
        .send({ categoria: '', titulo: '', texto: '' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Datos inválidos')
    })
  })
})
