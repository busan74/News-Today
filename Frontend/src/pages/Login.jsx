import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { usePageMeta } from '../hooks/usePageMeta'

function Login() {
    usePageMeta({ title: 'Iniciar sesión' })
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await Api.post('/auth/login', { username, password })
            login(res.token)
            navigate('/administracion')
        } catch (err) {
            setError(err.message === 'No autorizado' ? 'Credenciales incorrectas' : err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main id="main" className="page">
            <div className="form-card">
                <h2 className="form-title">Iniciar Sesión</h2>
                <p className="form-subtitle">Acceso al panel de administración.</p>
                {error && <p className="form-error">{error}</p>}
                <form onSubmit={handleLogin} className="form">
                    <div className="form-field">
                        <label htmlFor="username">Usuario:</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Iniciando…' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </main>
    )
}

export default Login
