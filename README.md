# IMDb Mini Game

Juego cortito para adivinar qué versión de una peli está mejor rankeada en IMDb, con chat en vivo para jugar con amigos.

## Cómo funciona

- Te muestra 2 o 3 versiones de la misma película (remakes, live-actions, etc.).
- Elegís cuál pensás que tiene mejor rating de IMDb.
- Se revelan los ratings reales y sumás punto si acertaste.
- Chat al costado en tiempo real para putearse.

## Setup

### 1. Chat con Supabase

Necesitás una cuenta gratis en [supabase.com](https://supabase.com) y crear un proyecto.

Este juego usa **Supabase Realtime Broadcast**, que **no requiere tabla ni SQL** — los mensajes viajan en vivo por WebSocket y no se guardan. Perfecto para un chat efímero entre amigos.

En **Project Settings → API** copiá:
- `Project URL`
- `anon public` key

Pegalos en `config.js`:

```js
export const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOi...";
```

### 2. Correrlo localmente

Como usa ES modules, hay que servirlo por HTTP (no abrir el `index.html` con `file://`):

```bash
# con python
python3 -m http.server 8000

# o con node
npx serve
```

Y abrís http://localhost:8000

### 3. Deploy

Sirve cualquier hosting estático:

- **GitHub Pages**: Settings → Pages → Branch `main` → carpeta raíz.
- **Vercel / Netlify**: importás el repo y listo, sin config.

## Archivos

```
├── index.html      # UI
├── style.css       # Estilos (dark mode)
├── app.js          # Juego + chat
├── movies.js       # Sets de películas (título + año)
├── config.js       # OMDb key + Supabase creds
└── README.md
```

## Agregar más películas

Editá `movies.js` y agregá un objeto al array:

```js
{ name: "Nombre del set", versions: [
  { title: "Título exacto", year: "1999" },
  { title: "Título exacto", year: "2023" },
]},
```

El juego busca en OMDb por `title + year`, así que asegurate que el título coincida con el de IMDb.

## Créditos

- Datos: [OMDb API](http://www.omdbapi.com/)
- Chat: [Supabase Realtime](https://supabase.com/docs/guides/realtime)
