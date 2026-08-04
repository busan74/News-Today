import NewsSection from './NewsSection'

const Tiempo = () => {
    return (
        <NewsSection titulo="Tiempo" categoria="tiempo">
            <div className="weather">
                <span className="weather-icon" role="img" aria-label="Despejado">☀️</span>
                <div>
                    <strong>24°C</strong>
                    <p>Despejado, máxima de 28°C</p>
                </div>
            </div>
        </NewsSection>
    )
}

export default Tiempo
