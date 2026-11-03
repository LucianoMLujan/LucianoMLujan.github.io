# Luciano Luján — Portfolio

Desarrollador Full Stack | Portfolio personal construido con Astro

## Preview

[![Preview](https://img.shields.io/badge/Ver%20Portfolio-en%20línea-blue?style=for-the-badge)](https://tu-url-aqui.vercel.app)

## Stack

- **Framework:** [Astro](https://astro.build/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Animaciones 3D:** [Three.js](https://threejs.org/)

## Inicio rápido

> Requiere **Node.js ≥ 22.12** (el proyecto incluye `.nvmrc` con Node 24). Con nvm: `nvm use`.

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Build de producción
pnpm build

# Vista previa del build
pnpm preview
```

El servidor de desarrollo estará disponible en `http://localhost:4321`.

> Si el navegador no puede crear un contexto WebGL (por ejemplo, con aceleración por software), las animaciones usan automáticamente un respaldo con Canvas 2D.

## Estructura del proyecto

```text
/
├── public/
│   └── images/
├── src/
│   ├── components/
│   │   ├── Contact.astro
│   │   ├── Education.astro
│   │   ├── Experience.astro
│   │   ├── Hero.astro
│   │   ├── Navbar.astro
│   │   └── three/
│   │       ├── CodeBackground.astro
│   │       ├── HeroScene.astro
│   │       └── SectionDecor.astro
│   ├── lib/
│   │   ├── motion.ts
│   │   ├── skills.ts
│   │   └── three/
│   │       ├── decor.ts
│   │       ├── fallback2d.ts
│   │       └── glyphs.ts
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
└── package.json
```

## Secciones

| Sección | Descripción |
|---------|-------------|
| **Hero** | Presentación principal con nombre, título y foto de perfil |
| **Experiencia** | Timeline animada al scroll, con nodos, tarjetas interactivas y espiral 3D |
| **Educación** | Formación académica y certificaciones con revelado progresivo y núcleo 3D |
| **Contacto** | Información de contacto y enlaces a redes sociales |

## Despliegue

Este proyecto está configurado para desplegarse en [Vercel](https://vercel.com) o [Netlify](https://netlify.com). Simplemente conecta tu repositorio y se desplegará automáticamente.

## Licencia

MIT
