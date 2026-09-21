# SolidJS Project Scaffolding & Tooling Guide (v1.x Production)

This guide documents baseline tooling, project templates (Vite + TS, SolidStart), and configuration files for modern SolidJS 1.x projects.

---

## 1. Project Initialization

### 1.1 Client-Side SPA (Vite + TypeScript)
```bash
# Initialize minimal, production-grade Vite template
npm create vite@latest my-solid-app -- --template solid-ts
cd my-solid-app
npm install
```

### 1.2 Full-Stack Application (SolidStart 1.0)
```bash
# Initialize modern SolidStart 1.0 project
npm create solid@latest my-start-app
cd my-start-app
npm install
```

### 1.3 Targeting SolidJS 2.0-rc.9 (Release Candidate)
```bash
# Upgrade solid-js to the 2.0 Release Candidate
npm install solid-js@^2.0.0-rc.9
```
When targeting 2.0-rc, full-stack start mode is provided directly via `@solidjs/vite-plugin` (`solid({ start: true })`) rather than standalone `@solidjs/start`.

---

## 2. TypeScript Configuration (`tsconfig.json`)

SolidJS requires `"jsxImportSource": "solid-js"` to enable its JSX compiler:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "types": ["vite/client"],
    "strict": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

> [!CAUTION]
> If `"jsxImportSource": "solid-js"` is missing, TypeScript will fall back to React's JSX types, causing spurious type errors on Solid event handlers and directives.

---

## 3. Recommended Project Folder Architecture

```text
src/
├── assets/          # Static images, SVG, icons
├── components/      # Reusable UI primitives (Button, Card, Modal)
│   └── ui/          # Headless Kobalte/Corvu primitives
├── context/         # Cross-tree shared stores & Providers
├── directives/      # Reusable DOM directives (use:clickOutside)
├── lib/             # API clients, utilities, validation schemas
├── pages/ or routes/# Application views & router components
├── App.tsx          # Root router & layout integration
├── index.css        # Global CSS variables & reset
└── index.tsx        # Client entrypoint (`render(() => <App />, root)`)
```
