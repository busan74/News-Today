import request from 'supertest'
import app from '../app'

describe('Suscripciones', () => {
  it('registra una suscripción y devuelve la creada', async () => {
    const res = await request(app).post('/api/suscripcion').send({
      email: 'lector@example.com',
    })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.email).toBe('lector@example.com')
    expect(res.body.data.estado).toBe('activa')
  })

  it('es idempotente: no duplica el mismo email', async () => {
    await request(app).post('/api/suscripcion').send({ email: 'lector@example.com' })
    const res = await request(app).post('/api/suscripcion').send({ email: 'lector@example.com' })

    expect(res.status).toBe(201)
    expect(res.body.data.email).toBe('lector@example.com')

    const listado = await request(app).get('/api/suscripcion')
    expect(listado.status).toBe(401)
  })

  it('rechaza emails inválidos', async () => {
    const res = await request(app).post('/api/suscripcion').send({ email: 'no-valido' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Datos inválidos')
  })

  it('solo el admin puede listar suscripciones', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      username: 'admin',
      email: 'admin@news-today.local',
      password: 'password123',
    })

    await request(app).post('/api/suscripcion').send({ email: 'lector@example.com' })

    const res = await request(app)
      .get('/api/suscripcion')
      .set('Authorization', `Bearer ${reg.body.token}`)
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })
})
