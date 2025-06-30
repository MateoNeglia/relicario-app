## Funcionalidades
**Inicio de la app**
``npm install``

``npm run dev``
**Agregar .env a con las variables de entorno:**
``VITE_BACKEND_URL=http://localhost:8081``
VITE_GOOGLE_CLIENT_ID=*clientid para google*
``NODE_ENV=production``

- **Layout Principal**: `MainLayout` con `NavBar` y `Outlet` para rutas anidadas.
- Página de inicio (`/`): Bienvenida con CTA (Login/Registrarse) para usuarios no autenticados, redirige a `/profile` si autenticado.
- Registro (`/register`): Formulario MUI, diseño dividido (desktop), imagen con overlay (mobile).
- Inicio de sesión (`/login`): Formulario MUI centrado.
- Navbar (`NavBar`): 
  - `<h1>` con logo SVG.
  - Minimal (solo logo) en `/login`, `/register`.
  - Completo: `SearchBar` (autenticados), botones Profile/Login, Admin (si admin).
- Rutas protegidas: `/profile` (autenticados), `/admin` (solo admins).
- Inicio con Google OAuth: Botón con `primary.light` (#6e324a).
- Componentes reutilizables:
  - `Input`: MUI TextField.
  - `Button`: MUI Button con `color` y `textColor`.
  - `NavBar`: MUI AppBar con logo y botones condicionales.
- Paleta: `src/config/palette.js`, `src/styles/palette.scss` con `@use`.
  - Primary: #48182f, light: #6e324a
  - Secondary: #d4cbc4
  - Background: #f0f4f5, #ffffff
  - Text: #131313, #dadada
- Estilos: MUI, SASS con `@use`.
- Autenticación: JWT via `AuthContext`.
- Navegación: React Router.