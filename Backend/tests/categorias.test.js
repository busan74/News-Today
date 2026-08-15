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

const crearEditor = async (username, email) => {
  const loginAdmin = await request(app).post('/api/auth/login').send({
    username: 'admin',
    password: 'password123',
  })
  await request(app)
    .post('/api/auth/register')
    .set('Authorization', `Bearer ${loginAdmin.body.token}`)
    .send({ username, email, password: 'password123' })
  const loginEditor = await request(app).post('/api/auth/login').send({
    username,
    password: 'password123',
  })
  return loginEditor.body.token
}

describe('Categorías', () => {
  it('lista categorías', async () => {
    const token = await crearAdmin()
    await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'deportes', nombre: 'Deportes' })

    const res = await request(app).get('/api/categorias')
    expect(res.status).toBe(200)
    expect(res.body.data[0].slug).toBe('deportes')
  })

  it('permite crear solo a administradores', async () => {
    const tokenAdmin = await crearAdmin()
    const tokenEditor = await crearEditor('editor1', 'editor1@news-today.local')

    const sinToken = await request(app)
      .post('/api/categorias')
      .send({ slug: 'cultura', nombre: 'Cultura' })
    expect(sinToken.status).toBe(401)

    const conEditor = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenEditor}`)
      .send({ slug: 'cultura', nombre: 'Cultura' })
    expect(conEditor.status).toBe(403)

    const conAdmin = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ slug: 'cultura', nombre: 'Cultura' })
    expect(conAdmin.status).toBe(201)
  })

  it('rechaza slugs duplicados', async () => {
    const token = await crearAdmin()
    await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'deportes', nombre: 'Deportes' })

    const res = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'deportes', nombre: 'Deportes 2' })
    expect(res.status).toBe(409)
  })

  it('actualiza y elimina categorías', async () => {
    const token = await crearAdmin()
    const creada = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'deportes', nombre: 'Deportes' })

    const actualizada = await request(app)
      .put(`/api/categorias/${creada.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'deportes', nombre: 'Deportes 2026' })
    expect(actualizada.status).toBe(200)
    expect(actualizada.body.data.nombre).toBe('Deportes 2026')

    const eliminada = await request(app)
      .delete(`/api/categorias/${creada.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(eliminada.status).toBe(200)
  })
})
