import mongoose from 'mongoose'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { arrancarMongoEnMemoria } from '../config/memoria'

let servidor

beforeAll(async () => {
  servidor = await arrancarMongoEnMemoria()
  await mongoose.connect(servidor.uri)
})

afterEach(async () => {
  const colecciones = mongoose.connection.collections
  await Promise.all(Object.values(colecciones).map((c) => c.deleteMany({})))
})

afterAll(async () => {
  await mongoose.disconnect()
  if (servidor) await servidor.detener()
})
