const { spawn, execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const net = require('net')

const binarioFunciona = (p) => {
  try {
    const salida = execFileSync(p, ['--version'], {
      timeout: 15000,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return /db version/.test(salida)
  } catch {
    return false
  }
}

const encontrarBinario = async () => {
  const override = process.env.MONGOMS_OVERRIDE_BINARY_PATH
  if (override && fs.existsSync(override) && binarioFunciona(override)) return override

  const dir = path.join(os.homedir(), '.cache', 'mongodb-binaries')
  if (fs.existsSync(dir)) {
    const candidatos = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith('mongod-') && !f.endsWith('.tgz'))
      .sort()
      .map((f) => path.join(dir, f))
    for (const c of candidatos) {
      if (binarioFunciona(c)) return c
    }
  }

  const { MongoBinary } = require('mongodb-memory-server-core')
  process.env.MONGOMS_DISTRO = process.env.MONGOMS_DISTRO || 'ubuntu-22.04'
  const p = await MongoBinary.getPath()
  if (binarioFunciona(p)) return p

  throw new Error('No se encontró un binario de MongoDB funcional')
}

const esperarPuerto = (puerto, proceso, tiempoLimite = 30000) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('mongod no arrancó a tiempo'))
    }, tiempoLimite)

    const intentar = () => {
      const sock = net.connect(puerto, '127.0.0.1')
      sock.on('connect', () => {
        clearTimeout(timeout)
        sock.destroy()
        resolve()
      })
      sock.on('error', () => setTimeout(intentar, 250))
    }

    intentar()
    proceso.on('exit', (codigo) => {
      clearTimeout(timeout)
      reject(new Error(`mongod terminó antes de arrancar (código ${codigo})`))
    })
  })

const arrancarMongoEnMemoria = async () => {
  const binario = await encontrarBinario()
  const baseDir = path.join(os.homedir(), '.cache', 'news-today-mongo')
  fs.mkdirSync(baseDir, { recursive: true })
  const dbpath = fs.mkdtempSync(path.join(baseDir, 'mongo-'))
  const puerto = 27000 + Math.floor(Math.random() * 1000)
  const proceso = spawn(
    binario,
    [
      '--port', String(puerto),
      '--dbpath', dbpath,
      '--storageEngine', 'wiredTiger',
      '--wiredTigerCacheSizeGB', '0.25',
      '--bind_ip', '127.0.0.1',
      '--noauth',
    ],
    { stdio: 'ignore' }
  )

  const uri = `mongodb://127.0.0.1:${puerto}/news-today`
  await esperarPuerto(puerto, proceso)

  return {
    uri,
    detener: () =>
      new Promise((resolve) => {
        proceso.once('exit', () => resolve())
        proceso.kill('SIGTERM')
        setTimeout(() => {
          try {
            proceso.kill('SIGKILL')
          } catch {}
          resolve()
        }, 5000)
      }).finally(() => {
        try {
          fs.rmSync(dbpath, { recursive: true, force: true })
        } catch {}
      }),
  }
}

module.exports = { arrancarMongoEnMemoria }
