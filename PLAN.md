# News Today — Estado del proyecto

## Estructura actual

```
News-Today/
├── Frontend/            # App React (Vite) — el sitio de noticias
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env / .env.example
│   ├── nginx.conf       # proxifica /api → backend y sirve el SPA
│   ├── Dockerfile
│   └── src/
│       ├── main.jsx, App.jsx, index.css
│       ├── pages/       # Home, Navbar, Login, Suscripcion, Administracion
│       ├── Components/  # Actualidad, Deportes, Politica, etc.
│       └── services/api.js
├── Backend/             # API Express + Supabase (PostgREST + Auth)
│   ├── Server.js        # entrada: arranca la API (http/https opcional)
│   ├── app.js           # app Express (separada para tests)
│   ├── config/          # env.js, supabase.js (cliente + fake para tests), sembrar.js
│   ├── controllers/     # auth, noticias, categorias, suscripciones, webhook
│   ├── routes/          # /api/auth, /api/noticias, /api/categorias, /api/suscripcion
│   ├── middleware/      # auth (JWT de Supabase verificado por JWKS), errores
│   ├── services/        # email.js, stripe.js
│   ├── tests/           # Vitest + supertest + fakeSupabase.js (23 tests)
│   ├── seed.js          # categorías + admin + 17 noticias
│   ├── Dockerfile       # imagen del backend (node:22-alpine)
│   ├── package.json
│   └── .env / .env.example
├── supabase/
│   └── schema.sql       # tablas (categorias, noticias, profiles, suscripciones) + RLS
├── docker-compose.yml   # backend + frontend (sin Mongo: la BD es Supabase en la nube)
└── PLAN.md
```

## Cómo ejecutar

### 0. Preparar Supabase (una sola vez)

1. Crea el proyecto en https://supabase.com (si no existe) con las claves de `Backend/.env` (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`).
2. En el Dashboard → **SQL Editor** → New query, pega el contenido de `supabase/schema.sql` y ejecútalo (crea `categorias`, `noticias`, `profiles`, `suscripciones` + RLS).
3. En **Authentication → Settings**, desactiva el campo *Confirm email* (o el email confirmado no podrá iniciar sesión hasta confirmarlo) si quieres login inmediato.
4. Lanza el seed para cargar datos de ejemplo y el admin:
   ```bash
   cd Backend && npm install && npm run seed
   ```

> El primer usuario registrado por la web es `editor`; solo el admin del seed (o el primer registro si aún no hay perfiles) tiene rol `admin`.

### Opción A — Docker (recomendada)

```bash
# Construye y lanza backend + frontend (la BD ya está en Supabase, no hay contenedor Mongo)
docker compose up -d

# Frontend: http://localhost:5173   Backend: http://localhost:8080
# Para ver logs o parar:
docker compose logs -f
docker compose down
```

- `backend` (hace el seed idempotente al arrancar y usa las claves de Supabase de `Backend/.env` vía `env_file`), `frontend` (nginx que sirve el build y proxifica `/api` → `backend:8080`, mismo origen, sin CORS). Requiere Docker Engine con Compose v2.
- ⚠️ Detén cualquier backend anterior que ocupe el puerto 8080 (`pkill -f Server.js` o el que uses) antes de `docker compose up -d`.

### Opción B — desarrollo (npm)

```bash
# Backend (puerto 8080)
cd Backend && npm install && npm run seed   # una vez, para crear admin/categorías/noticias
npm run dev

# Frontend (puerto 5173)
cd Frontend && npm install && npm run dev
```

**Admin por defecto** (definido en `Backend/.env`): usuario `admin`, email `apps.busan74@gmail.com`. El login acepta usuario o email. La autenticación la gestiona Supabase Auth; el backend valida los JWT con la clave pública del proyecto (`SUPABASE_JWKS_URL`) y lee el rol (`admin`/`editor`) del perfil.

## Tests

```bash
# Frontend (11 tests: ArticleCard, NewsSection, Login, NotFound)
cd Frontend && npm test

# Backend (23 tests: auth, noticias, categorías, suscripciones)
cd Backend && npm test
```

- Los tests del backend usan un **fake de Supabase** (`Backend/tests/fakeSupabase.js`): una implementación en memoria de `from().select().eq().or().insert()…` y de `auth.admin.createUser`/`signInWithPassword`. Se activa automáticamente con `NODE_ENV=test`, sin tocar la red ni la nube.
- `config/supabase.js` devuelve el fake cuando `NODE_ENV=test`; en cualquier otro entorno crea el cliente real con `SUPABASE_SECRET_KEY`.
