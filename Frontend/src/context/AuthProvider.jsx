import { useCallback, useState } from 'react'
import { AuthContext } from './authContext'

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('nt_token'))

    const login = useCallback((nuevoToken) => {
        localStorage.setItem('nt_token', nuevoToken)
        setToken(nuevoToken)
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('nt_token')
        setToken(null)
    }, [])

    return (
        <AuthContext.Provider value={{ token, isAuth: Boolean(token), login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
