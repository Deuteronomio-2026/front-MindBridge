# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
---
---

## 📁 Estructura de Carpetas

```bash
src/
├── app/
│   ├── App.tsx                  # Componente raíz
│   └── router.tsx               # Configuración de rutas
│
├── assets/                      # Imágenes, íconos y recursos estáticos
│
├── components/                  # Componentes reutilizables globales
│                                # (botones, inputs, modales, etc.)
│
├── context/                     # Contextos globales
│   ├── UserContext.ts           # createContext (SIN lógica)
│   ├── UserProvider.tsx         # Provider (estado + lógica)
│   └── user.types.ts            # Tipos del dominio usuario
│
├── hooks/                       # Custom hooks reutilizables
│   └── useUser.ts               # Hook para consumir UserContext
│
├── data/                        # Datos mock (temporal / desarrollo)
│   └── psychologists.ts
│
├── features/                    # Lógica por dominio (feature-based)
│   ├── offers/
│   └── psychologists/
│
├── pages/                       # Vistas principales (rutas)
│   ├── Auth.tsx
│   │
│   ├── admin/
│   │   └── ...
│   │
│   └── psych/
│       ├── PsychRoot.tsx        # Layout principal del psicólogo
│       │
│       ├── home/
│       │   └── PsychHome.tsx
│       │
│       ├── appointments/
│       │   └── PsychAppointments.tsx
│       │
│       ├── schedule/
│       │   └── PsychSchedule.tsx
│       │
│       └── profile/
│           └── ...
│
├── services/                    # Llamadas a APIs
│
├── store/                       # Estado global (futuro: Zustand/Redux)
│
├── styles/                      # Estilos globales
│
└── main.tsx                     # Entry point