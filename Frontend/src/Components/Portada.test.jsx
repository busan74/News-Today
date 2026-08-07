import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Portada from './Portada'

vi.mock('../services/api', () => ({
    getPortada: vi.fn(),
}))

import { getPortada } from '../services/api'

const portada = {
    id: 9,
    categoria: 'actualidad',
    titulo: 'Nuevo enlace a la AP-4',
    texto: 'Ya está operativo el nuevo acceso a la autovía.',
    fecha: '2026-08-06T09:00:00.000Z',
    imagen: '/images/noticia-1.jpg',
    portada: true,
}

const renderPortada = () =>
    render(
        <MemoryRouter>
            <Portada />
        </MemoryRouter>
    )

describe('Portada', () => {
    it('no renderiza nada mientras carga', () => {
        getPortada.mockReturnValue(new Promise(() => {}))

        renderPortada()

        expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })

    it('muestra la noticia principal con su título y enlace', async () => {
        getPortada.mockResolvedValue({ data: portada })

        renderPortada()

        const titulo = await screen.findByRole('heading', {
            name: 'Nuevo enlace a la AP-4',
        })
        expect(titulo).toBeInTheDocument()
        expect(screen.getByText('Ya está operativo el nuevo acceso a la autovía.')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Leer más' })).toHaveAttribute(
            'href',
            '/noticia/9'
        )
    })

    it('no muestra nada si no hay noticia principal', async () => {
        getPortada.mockRejectedValue(new Error('No hay noticias'))

        renderPortada()

        await waitFor(() => {
            expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
        })
    })
})
