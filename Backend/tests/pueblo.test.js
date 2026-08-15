import request from 'supertest'
import app from '../app'
import { obtenerFilas } from './fakeSupabase'

const registrar = (username, email, token) => {
  let req = request(app)
    .post('/api/auth/register')
    .send({ username, email, password: 'password123' })
  if (token) req = req.set('Authorization', `Bearer ${token}`)
  return req
}

const crearAdmin = async () => {
  await registrar('admin', 'admin@news-today.local')
  const login = await request(app).post('/api/auth/login').send({
    username: 'admin',
    password: 'password123',
  })
  return login.body.token
}

const crearEditor = async () => {
  const tokenAdmin = await crearAdmin()
  const editor = await registrar('editor', 'editor@news-today.local', tokenAdmin)
  return editor.body.token
}

describe('Seguridad multi-tenant', () => {
  it('un editor solo puede escribir en su propio pueblo', async () => {
    const token = await crearEditor()

    const crear = () =>
      request(app)
        .post('/api/noticias')
        .set('Authorization', `Bearer ${token}`)
        .send({ categoria: 'deportes', titulo: 'Noticia de mi pueblo', texto: 'Texto.' })

    const creada = await crear()
    expect(creada.status).toBe(201)

    const perfilEditor = obtenerFilas('profiles').find((p) => p.username === 'editor')
    perfilEditor.pueblo = 'lebrija'

    const bloqueada = await crear()
    expect(bloqueada.status).toBe(403)
    expect(bloqueada.body.error).toMatch(/otro pueblo/i)
  })

  it('un editor no puede borrar noticias', async () => {
    const token = await crearEditor()

    const creada = await request(app)
      .post('/api/noticias')
      .set('Authorization', `Bearer ${token}`)
      .send({ categoria: 'deportes', titulo: 'A borrar', texto: 'Texto.' })

    const res = await request(app)
      .delete(`/api/noticias/${creada.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('el administrador puede escribir y borrar en cualquier pueblo', async () => {
    const tokenAdmin = await crearAdmin()

    const creada = await request(app)
      .post('/api/noticias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ categoria: 'actualidad', titulo: 'Portada', texto: 'Texto.' })
    expect(creada.status).toBe(201)

    const borrada = await request(app)
      .delete(`/api/noticias/${creada.body.data.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
    expect(borrada.status).toBe(200)
  })
})
