# News Today — Estado del proyecto y pendientes

## Estructura actual

```
News-Today/
├── Frontend/            # App React (Vite) — el sitio de noticias
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env / .env.example
│   └── src/
│       ├── main.jsx, App.jsx, index.css
│       ├── pages/       # Home, Navbar, Login, Suscripcion, Administracion
│       ├── Components/  # Actualidad, Deportes, Politica, etc.
│       └── services/api.js
├── Backend/             # API Express + MongoDB (Mongoose)
│   ├── Server.js        # entrada: conecta BD y arranca
│   ├── app.js           # app Express (separada para tests)
│   ├── config/          # env.js, db.js, memoria.js (Mongo en memoria)
│   ├── models/          # Noticia, Categoria, Usuario, Suscripcion
│   ├── controllers/     # auth, noticias, categorias, suscripciones
│   ├── routes/          # /api/auth, /api/noticias, /api/categorias, /api/suscripcion
│   ├── middleware/      # auth (JWT), errores (validación + centralizados)
│   ├── services/        # email.js, stripe.js
│   ├── tests/           # Vitest + supertest (23 tests)
│   ├── seed.js          # categorías + admin + 17 noticias
│   ├── package.json
│   └── .env / .env.example
└── PLAN.md
```

## Errores corregidos

1. **Frontend no era un proyecto ejecutable** — le faltaban `package.json`, `vite.config.js`, `index.html`, `eslint.config.js` y dependencias. Se crearon y `npm run dev` ya funciona.
2. **Navegación rota** — el `Navbar` usaba `window.location.href` y las rutas (`/actualidad`, `/login`, …) no existían, por lo que devolvían 404. Se instaló `react-router-dom` y ahora todas las rutas están mapeadas en `App.jsx`.
3. **`Suscripcion.jsx` importaba `../lib/Api`** que no existía → import corregido a `../services/api`.
4. **`services/api.js`** no manejaba errores ni URL por defecto → se reescribió con un objeto `Api` (get/post) y fallback a `http://localhost:8080`.
5. **`Login.jsx`** dependía de `react-router-dom` (no instalado) → se instaló y ahora usa `useNavigate`.
6. **`Administracion.jsx` vacío** → se creó una página provisional.
7. **`Backend/Server.js` era un API de TPV copiada de otro proyecto** (ventas, productos, clientes, Stripe) con rutas y middlewares inexistentes, sin `app.listen` y sin `package.json`. No tenía ninguna relación con el sitio de noticias. Se reescribió como **API de noticias** que sirve `/api/noticias` y `/api/categorias` (lo que el frontend ya espera).
8. **`Backend/.env` contenía una cadena de conexión de MongoDB real en texto plano** → se eliminó y se dejó `MONGO_URI` comentado. **Decisión: NO rotar la credencial** — solo existió en local, nunca se subió a ningún repositorio remoto ni se expuso en otro sitio.
9. **Sin `.gitignore` en Backend ni Frontend** y la raíz tampoco ignoraba `node_modules` → se crearon (Backend, Frontend y raíz) para no commitear dependencias ni `.env`.

## Cómo ejecutar

```bash
# Backend (puerto 8080)
cd Backend && npm install && npm run dev
# En modo memoria (sin MONGO_URI) el seed se ejecuta solo al arrancar:
# crea 8 categorías, 17 noticias y el admin de ADMIN_USER/ADMIN_EMAIL/ADMIN_PASS (.env)
# Con MONGO_URI persistente, sembrar una vez: npm run seed

# Frontend (puerto 5173)
cd Frontend && npm install && npm run dev
```

**Admin por defecto** (definido en `Backend/.env`): usuario `admin`, email `apps.busan74@gmail.com`. El login acepta usuario o email. El primer usuario registrado por la web es `editor`; solo existe un `admin`.

## Tests

```bash
# Frontend (11 tests: ArticleCard, NewsSection, Login, NotFound)
cd Frontend && npm test

# Backend (23 tests: auth, noticias, categorías, suscripciones)
cd Backend && npm test
```

## Lo que falta para terminar

### 1. Backend y datos (prioridad alta)

- [x] **Base de datos real (MongoDB)** — modelos Mongoose en `Backend/models/` (`Noticia`, `Categoria`, `Usuario`, `Suscripcion`). `MONGO_URI` reservado en `Backend/.env`; si no está configurado, se usa un MongoDB real en memoria (`mongodb-memory-server` + `Backend/config/memoria.js`) — los datos no persisten entre reinicios, migrar a Atlas poniendo `MONGO_URI`.
- [x] **CRUD de noticias** — endpoints POST/PUT/DELETE de noticias (protegidos por JWT) y de categorías (solo admin) en `Backend/controllers/` + `Backend/routes/`.
- [x] **Autenticación real** — login/registro contra la BD con **JWT + bcrypt** (`POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`). El primer usuario registrado es `admin`, los siguientes `editor`. El `seed.js` crea el admin inicial (`ADMIN_USER`/`ADMIN_PASS` del `.env`).
- [x] **Suscripciones** — `POST /api/suscripcion` guarda en BD (idempotente por email) y envía email de bienvenida (`services/email.js`; en dev usa un transport de log, con SMTP si `SMTP_HOST` está configurado). Solo admin lista.
- [x] **Pagos** — Stripe integrado de forma condicional: si `STRIPE_SECRET_KEY`/`STRIPE_PRICE_ID` están en `.env`, la suscripción de pago crea checkout session y devuelve `checkoutUrl`; el webhook `POST /api/webhooks/stripe` activa la suscripción (`checkout.session.completed`). Sin clave, el flujo queda inactivo y las suscripciones son gratis.
- [x] **Validaciones y manejo de errores** — `express-validator` en las rutas, `middleware/errores.js` centraliza 400 (validación/CastError), 401, 403, 404, 409 (duplicados) y 500.
- [x] **Tests del backend** — Vitest + supertest en `Backend/tests/` (23 tests: auth, noticias, categorías, suscripciones) sobre MongoDB real en memoria.

### 2. Frontend (prioridad alta)

- [x] **Conectar componentes a la API** — `Actualidad`, `Deportes`, etc. cargan desde `getNoticias()` / `getCategorias()` con estados de carga y error (hook `useNoticias` + componente `NewsSection`).
- [x] **Vista de detalle de noticia** — ruta `/noticia/:id` con contenido completo y noticias relacionadas (`pages/NoticiaDetalle.jsx`).
- [x] **Búsqueda y filtros** — por palabra clave y por categoría en `/busqueda` (`pages/Busqueda.jsx`) y búsqueda desde el Navbar; backend soporta `?q=` y `?categoria=`.
- [x] **Imágenes en las noticias** — 17 imágenes de prueba (800×450, JPEG) en `Frontend/public/images/noticia-{1..17}.jpg` (fuente: picsum.photos con seed fijo). Campo `imagen` en las noticias del backend (las 17 seed + soporte en POST/PUT) y render en `ArticleCard` (lazy, decorativo en tarjetas) y `NoticiaDetalle`; campo "URL de la imagen" en el panel de administración.
- [x] **Panel de administración** — CRUD de noticias desde `/administracion` (formularios, listado, eliminar/editar), protegido por login (`pages/Administracion.jsx`).
- [x] **Estado de sesión** — contexto de autenticación (`context/AuthProvider.jsx` + `hooks/useAuth.js`), token en `localStorage`, ruta `/administracion` protegida (`ProtectedRoute.jsx`).
- [x] **Footer, página 404, accesibilidad y SEO** — `Footer` en todas las páginas, página 404 (`pages/NotFound.jsx`), enlace "saltar al contenido", `:focus-visible`, aria-labels y hook `usePageMeta` que actualiza título/description por página; metadatos OG en `index.html`.
- [x] **Tests de componentes** (Vitest + Testing Library) — `npm test` / `npm run test:watch` en `Frontend/`; 11 tests en `ArticleCard`, `NewsSection`, `Login` y `NotFound` (`src/**/*.test.jsx`, config en `vite.config.js` + `src/test/setup.js`). Labels de formularios asociados (`htmlFor`/`id`).

### 3. Repositorio, entorno y despliegue

- [x] **`node_modules/` y `dist/` fuera de git** — `git rm -r --cached node_modules dist`; los `.gitignore` ya los excluyen.
- [x] **Restos de la app Vite original borrados** — eliminados de la raíz `package.json`, `package-lock.json`, `index.html`, `vite.config.js`, `eslint.config.js`, `node_modules`, `dist`, `src`, `public` y `README.md`. La app vive en `Frontend/` y la API en `Backend/`.
- [x] **Variables de entorno centralizadas** — `Backend/config/env.js` carga `.env` (con ruta absoluta, funcione desde donde se lance), aplica defaults y **falla en producción** si faltan `JWT_SECRET`/`MONGO_URI`. `JWT_EXPIRES`, `ADMIN_USER`, `ADMIN_PASS` configurables.
- [x] **CORS configurable** — orígenes desde `CLIENT_URL` + `CORS_ORIGINS` (lista separada por comas) + localhost en desarrollo; `credentials: true`.
- [x] **HTTPS opcional** — con `SSL_CERT_PATH`/`SSL_KEY_PATH` la API sirve por https; `TRUST_PROXY` para ir detrás de un proxy reverso; shutdown graceful (SIGINT/SIGTERM) que cierra BD y limpia el mongod en memoria.
- [ ] **Despliegue** — pendiente (frontend en Vercel/Netlify, backend en Railway/Render). Decidido: **no** rotar credenciales de MongoDB (solo local, nunca expuestas) ni crear README.
