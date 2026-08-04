import request from 'supertest'
import app from '../app'
import Usuario from '../models/Usuario'

describe('Auth', () => {
  describe('POST /api/auth/register', () => {
    it('crea el primer usuario como admin y devuelve token', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'admin',
        email: 'admin@news-today.local',
        password: 'password123',
      })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.token).toBeTruthy()
      expect(res.body.user.username).toBe('admin')
      expect(res.body.user.role).toBe('admin')
      expect(res.body.user.password).toBeUndefined()

      const enBD = await Usuario.findOne({ username: 'admin' }).select('+password')
      expect(enBD.password).not.toBe('password123')
    })

    it('crea usuarios posteriores como editor', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'admin',
        email: 'admin@news-today.local',
        password: 'password123',
      })

      const res = await request(app).post('/api/auth/register').send({
        username: 'editor1',
        email: 'editor1@news-today.local',
        password: 'password123',
      })

      expect(res.status).toBe(201)
      expect(res.body.user.role).toBe('editor')
    })

    it('rechaza entradas inválidas', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'ab',
        email: 'no-es-un-email',
        password: '123',
      })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Datos inválidos')
      expect(res.body.detalles.length).toBeGreaterThan(0)
    })

    it('rechaza usuarios duplicados', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'admin',
        email: 'admin@news-today.local',
        password: 'password123',
      })

      const res = await request(app).post('/api/auth/register').send({
        username: 'admin',
        email: 'otro@news-today.local',
        password: 'password123',
      })

      expect(res.status).toBe(409)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        username: 'admin',
        email: 'admin@news-today.local',
        password: 'password123',
      })
    })

    it('inicia sesión con credenciales correctas', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'admin',
        password: 'password123',
      })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.token).toBeTruthy()
    })

    it('rechaza credenciales incorrectas', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'admin',
        password: 'incorrecta',
      })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Credenciales incorrectas')
    })
  })

  describe('GET /api/auth/me', () => {
    it('devuelve el perfil con token válido', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        username: 'admin',
        email: 'admin@news-today.local',
        password: 'password123',
      })

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${reg.body.token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.username).toBe('admin')
    })

    it('rechaza peticiones sin token', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.status).toBe(401)
      expect(res.body.error).toBe('No autorizado')
    })
  })
})
