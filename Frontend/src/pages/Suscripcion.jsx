import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Api } from '../services/api'
import { usePageMeta } from '../hooks/usePageMeta'

function Suscripcion() {
    usePageMeta({
        title: 'Suscribirse',
        description: 'Recibe las mejores noticias directamente en tu correo.',
    })
    const [email, setEmail] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await Api.post('/suscripcion', { email })
            alert('Suscripción exitosa')
            navigate('/')
        } catch (error) {
            console.error(error)
            alert('Error al suscribirse')
        }
    }

    return (
        <main id="main" className="page">
            <div className="form-card">
                <h2 className="form-title">Suscribirse</h2>
                <p className="form-subtitle">
                    Recibe las mejores noticias directamente en tu correo.
                </p>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-field">
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn">
                        Suscribirse
                    </button>
                </form>
            </div>
        </main>
    )
}

export default Suscripcion
