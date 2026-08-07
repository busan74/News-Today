import request from 'supertest'
import app from '../app'

const registrarAdmin = async () => {
  const res = await request(app).post('/api/auth/register').send({
    username: 'admin',
    email: 'admin@news-today.local',
    password: 'password123',
  })
  return res.body.token
}

describe('Anuncios', () => {
  it('solo devuelve los anuncios activos', async () => {
    const token = await registrarAdmin()

    await request(app)
      .post('/api/anuncios')
      .set('Authorization', `Bearer ${token}`)
      .send({ empresa: 'Activo', tipo: 'imagen', contenido: 'https://img.example/a.png', activo: true })
    await request(app)
      .post('/api/anuncios')
      .set('Authorization', `Bearer ${token}`)
      .send({ empresa: 'Inactivo', tipo: 'imagen', contenido: 'https://img.example/b.png' })

    const res = await request(app).get('/api/anuncios')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].empresa).toBe('Activo')
    expect(res.body.data[0].tipo).toBe('imagen')
  })

  it('el admin puede crear un anuncio de video', async () => {
    const token = await registrarAdmin()

    const res = await request(app)
      .post('/api/anuncios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        empresa: 'Cafetería El Rincón',
        tipo: 'video',
        contenido: 'https://cdn.example/anuncio.mp4',
        enlace: 'https://cafeteria.example.com',
        activo: true,
      })

    expect(res.status).toBe(201)
    expect(res.body.data.empresa).toBe('Cafetería El Rincón')
    expect(res.body.data.enlace).toBe('https://cafeteria.example.com')
    expect(res.body.data.activo).toBe(true)
  })

  it('valida empresa, tipo y contenido', async () => {
    const token = await registrarAdmin()

    const res = await request(app)
      .post('/api/anuncios')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'audio', contenido: '' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Datos inválidos')
  })

  it('actualiza y elimina un anuncio', async () => {
    const token = await registrarAdmin()

    const creado = await request(app)
      .post('/api/anuncios')
      .set('Authorization', `Bearer ${token}`)
      .send({ empresa: 'Panadería Sol', tipo: 'imagen', contenido: 'https://img.example/p.png' })
    const id = creado.body.data.id

    const upd = await request(app)
      .put(`/api/anuncios/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ activo: true })
    expect(upd.status).toBe(200)
    expect(upd.body.data.activo).toBe(true)

    const del = await request(app)
      .delete(`/api/anuncios/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(del.status).toBe(200)
    expect(del.body.data.id).toBe(id)

    const res = await request(app).get('/api/anuncios')
    expect(res.body.data).toHaveLength(0)
  })

  it('filtra por ventana de fechas: futuro no aparece', async () => {
    const token = await registrarAdmin()
    const en = (dias) => new Date(Date.now() + dias * 86400000).toISOString()

    await request(app)
      .post('/api/anuncios')
      .set('Authorization', `Bearer ${token}`)
      .send({ empresa: 'Activo hoy', tipo: 'imagen', contenido: 'https://img.example/a.png', activo: true })
    await request(app)
      .post('/api/anuncios')
      .set('Authorization', `Bearer ${token}`)
      .send({ empresa: 'Futuro', tipo: 'imagen', contenido: 'https://img.example/f.png', activo: true, fecha_inicio: en(5) })

    const res = await request(app).get('/api/anuncios')
    expect(res.status).toBe(200)
    const empresas = res.body.data.map((a) => a.empresa)
    expect(empresas).toContain('Activo hoy')
    expect(empresas).not.toContain('Futuro')
  })

  it('exige admin para crear y listar todos', async () => {
    const crearSinToken = await request(app).post('/api/anuncios').send({ empresa: 'X', contenido: 'y' })
    expect(crearSinToken.status).toBe(401)

    const listarSinToken = await request(app).get('/api/anuncios/todos')
    expect(listarSinToken.status).toBe(401)
  })
})
