import { afterEach } from 'vitest'
import { restablecer } from './fakeSupabase'

process.env.NODE_ENV = 'test'

afterEach(() => restablecer())
