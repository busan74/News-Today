import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NewsSection from './NewsSection'

vi.mock('../hooks/useNoticias', () => ({
    useNoticias: vi.fn(),
}))

import { useNoticias } from '../hooks/useNoticias'

const noticiasMock = [
    {
        id: 1,
        categoria: 'deportes',
        titulo: 'Noticia uno',
        texto: 'Texto de la noticia uno.',
        fecha: '2026-08-04T11:00:00.000Z',
    },
    {
        id: 2,
        categoria: 'deportes',
        titulo: 'Noticia dos',
        texto: 'Texto de la noticia dos.',
        fecha: '2026-08-03T11:00:00.000Z',
    },
]

const renderSeccion = (props = {}) =>
    render(
        <MemoryRouter>
            <NewsSection titulo="Deportes" categoria="deportes" {...props} />
        </MemoryRouter>
    )

describe('NewsSection', () => {
    it('muestra el estado de carga', () => {
        useNoticias.mockReturnValue({ noticias: null, loading: true, error: null })

        renderSeccion()

        expect(screen.getByText(/Cargando noticias/)).toBeInTheDocument()
    })

    it('renderiza las noticias recibidas', () => {
        useNoticias.mockReturnValue({ noticias: noticiasMock, loading: false, error: null })

        renderSeccion()

        expect(screen.getByRole('heading', { name: 'Deportes' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Noticia uno' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Noticia dos' })).toBeInTheDocument()
    })

    it('muestra el mensaje de error cuando falla la carga', () => {
        useNoticias.mockReturnValue({ noticias: null, loading: false, error: '500' })

        renderSeccion()

        expect(screen.getByText(/No se pudieron cargar las noticias/)).toBeInTheDocument()
    })

    it('muestra mensaje cuando no hay noticias', () => {
        useNoticias.mockReturnValue({ noticias: [], loading: false, error: null })

        renderSeccion()

        expect(
            screen.getByText('Aún no hay noticias en esta sección.')
        ).toBeInTheDocument()
    })
})
