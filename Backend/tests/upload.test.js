import request from 'supertest'
import fs from 'fs'
import path from 'path'
import app from '../app'

const registrarAdmin = async () => {
  const res = await request(app).post('/api/auth/register').send({
    username: 'admin',
    email: 'admin@news-today.local',
    password: 'password123',
  })
  return res.body.token
}

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

const UN_PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('Subida de archivos', () => {
  it('exige autenticación', async () => {
    const res = await request(app).post('/api/upload').send({ archivo: `data:image/png;base64,${UN_PIXEL}` })
    expect(res.status).toBe(401)
  })

  it('sube una imagen y devuelve su URL', async () => {
    const token = await registrarAdmin()
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${token}`)
      .send({ archivo: `data:image/png;base64,${UN_PIXEL}` })

    expect(res.status).toBe(201)
    expect(res.body.url).toMatch(/^\/uploads\/images\/.+\.png$/)

    const archivo = path.join(UPLOAD_DIR, 'images', path.basename(res.body.url))
    expect(fs.existsSync(archivo)).toBe(true)
    fs.rmSync(archivo, { force: true })
  })

  it('sube un video y devuelve su URL', async () => {
    const token = await registrarAdmin()
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${token}`)
      .send({ archivo: 'data:video/mp4;base64,AAAA' })

    expect(res.status).toBe(201)
    expect(res.body.url).toMatch(/^\/uploads\/videos\/.+\.mp4$/)

    const archivo = path.join(UPLOAD_DIR, 'videos', path.basename(res.body.url))
    expect(fs.existsSync(archivo)).toBe(true)
    fs.rmSync(archivo, { force: true })
  })

  it('rechaza formatos no permitidos', async () => {
    const token = await registrarAdmin()
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${token}`)
      .send({ archivo: 'data:text/html;base64,PGI+hola' })

    expect(res.status).toBe(400)
  })
})

