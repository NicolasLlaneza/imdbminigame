# IMDb Mini Game

Juego cortito para adivinar qué versión de una peli está mejor rankeada en IMDb, con chat en vivo para jugar con amigos.

## Cómo funciona

- Te muestra 2 o 3 versiones de la misma película (remakes, live-actions, etc.).
- Elegís cuál pensás que tiene mejor rating de IMDb.
- Se revelan los ratings reales y sumás punto si acertaste.
- Chat al costado en tiempo real para putearse.

## Setup

### 1. Chat con Ably

Necesitás una cuenta gratis en [ably.com](https://ably.com/signup). El free tier da 6M mensajes/mes y 200 conexiones simultáneas — sobra para 3 amigos.

En el **dashboard → Apps → Default → API Keys**, copiá la **Root key** (la de arriba, con todos los permisos).

Pegala en `config.js`:

```js
export const ABLY_API_KEY = "TU-APP-ID.TU-KEY-ID:TU-KEY-SECRET";
```

> ⚠️ La key queda visible en el frontend. Para un chat entre 3 amigos es aceptable; en producción se usa token auth desde un backend chico.

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
- Chat: [Ably Realtime](https://ably.com/docs/realtime)
