import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'

const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }))

vi.mock('../services/api', () => ({
    Api: { post: vi.fn() },
    getAnuncios: vi.fn().mockResolvedValue({ data: [] }),
}))

vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({ login: loginMock }),
}))

import { Api } from '../services/api'

describe('Login', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('autentica al usuario y guarda el token', async () => {
        Api.post.mockResolvedValue({ token: 'abc123' })
        const user = userEvent.setup()

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        await user.type(screen.getByLabelText('Usuario:'), 'admin')
        await user.type(screen.getByLabelText('Contraseña:'), 'password')
        await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

        expect(Api.post).toHaveBeenCalledWith('/auth/login', {
            username: 'admin',
            password: 'password',
        })
        expect(loginMock).toHaveBeenCalledWith('abc123')
    })

    it('muestra un error cuando las credenciales son incorrectas', async () => {
        Api.post.mockRejectedValue(new Error('No autorizado'))
        const user = userEvent.setup()

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        await user.type(screen.getByLabelText('Usuario:'), 'admin')
        await user.type(screen.getByLabelText('Contraseña:'), 'incorrecta')
        await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

        expect(await screen.findByText('Credenciales incorrectas')).toBeInTheDocument()
        expect(loginMock).not.toHaveBeenCalled()
    })

    it('deshabilita el botón mientras inicia sesión', async () => {
        let resolver
        Api.post.mockReturnValue(
            new Promise((resolve) => {
                resolver = resolve
            })
        )
        const user = userEvent.setup()

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        await user.type(screen.getByLabelText('Usuario:'), 'admin')
        await user.type(screen.getByLabelText('Contraseña:'), 'password')
        await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

        expect(screen.getByRole('button', { name: 'Iniciando…' })).toBeDisabled()

        await act(async () => {
            resolver({ token: 'abc123' })
        })
    })
})
