# Mundial Predictor 2026 — Frontend Angular

## Stack
- **Angular 17+** — Standalone Components (sin NgModule)
- **TypeScript** — strict mode
- **SCSS** — CSS custom properties (design tokens)
- **Angular Router** — Lazy loading en todas las features
- **Tipografías** — Rajdhani (display) + Inter (body) via Google Fonts

---

## Setup inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar la URL del backend
Editar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: '/api',  // apunta al proxy — NO cambiar este
};
```

### 3. Configurar el proxy (CORS local)
`proxy.conf.json` ya está configurado. Apunta a `http://localhost:8080` por defecto.
Si tu backend corre en otro puerto, cambiar la línea `"target"`:
```json
{
  "/api": {
    "target": "http://localhost:TU_PUERTO",
    ...
  }
}
```

### 4. Ejecutar en desarrollo
```bash
npm start
# equivalente a: ng serve --proxy-config proxy.conf.json
```

La app corre en `http://localhost:4200`.

---

## Assets requeridos

Colocar en `src/assets/images/`:

| Archivo              | Uso                              |
|----------------------|----------------------------------|
| `bg-stadium.jpg`     | Fondo de pantalla Login/Registro |
| `logo.svg`           | Logo "Mundial Predictor 2026"    |
| `favicon.svg`        | Favicon del browser              |

> Los archivos de audio van en `src/assets/audio/` (postpuesto — ver MusicService).

---

## Estructura del proyecto

```
src/
├── app/
│   ├── app.component.ts          # Root component
│   ├── app.config.ts             # Bootstrap config (providers)
│   ├── app.routes.ts             # Rutas con lazy loading
│   │
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts     # Protege rutas privadas
│   │   ├── models/
│   │   │   └── domain.models.ts  # Interfaces TypeScript del dominio
│   │   └── services/
│   │       ├── auth.service.ts   # Login, logout, sesión en localStorage
│   │       ├── config.service.ts # Feature flags (isGroupPhaseActive, etc.)
│   │       └── music.service.ts  # Esqueleto de música (postpuesto)
│   │
│   └── features/
│       ├── auth/
│       │   ├── login/            # ✅ Implementado
│       │   └── register/         # ✅ Implementado (2 pasos)
│       ├── dashboard/            # ✅ Implementado (animación barrido)
│       ├── grupos/               # 🚧 Stub — próxima iteración
│       ├── eliminatorias/        # 🚧 Stub — próxima iteración
│       ├── leaderboard/          # 🚧 Stub — próxima iteración
│       ├── resultados/           # 🚧 Stub — próxima iteración
│       └── admin/                # 🚧 Stub — próxima iteración
│
├── environments/
│   ├── environment.ts            # Dev (apunta al proxy)
│   └── environment.prod.ts       # Prod (URL real del backend)
│
└── styles.scss                   # Tokens de diseño globales
```

---

## Puntos de configuración rápida

### Cambiar `loginType` según el backend
En `src/app/core/models/domain.models.ts`:
```typescript
export enum LoginType {
  USERNAME = 1,  // ← Cambiar si backend usa valor distinto
  EMAIL    = 2,
}
```

### Cambiar feature flags manualmente
En `src/app/core/services/config.service.ts`:
```typescript
private _config = signal<AppConfig>({
  isGroupPhaseActive:    true,   // ← true = módulo habilitado
  isKnockoutPhaseActive: false,  // ← false = bloqueado
});
```

### Adaptar campos de respuesta del backend
En `src/app/core/services/auth.service.ts`, método `_validateAndMapSession()`:
```typescript
const session: AuthSession = {
  userId: (res['userId'] ?? res['user_id'] ?? res['id']) as number,
  // ↑ Agregar aquí el nombre exacto del campo que retorna tu backend
};
```

---

## Rutas de la aplicación

| Ruta             | Componente         | Protegida |
|------------------|--------------------|-----------|
| `/login`         | LoginComponent     | ❌        |
| `/registro`      | RegisterComponent  | ❌        |
| `/dashboard`     | DashboardComponent | ✅        |
| `/grupos`        | GruposComponent    | ✅        |
| `/eliminatorias` | EliminatoriasComponent | ✅    |
| `/leaderboard`   | LeaderboardComponent | ✅      |
| `/resultados`    | ResultadosComponent | ✅       |
| `/admin`         | AdminComponent     | ✅        |

---

## Pendientes para próximas iteraciones

- [ ] Módulo Fase de Grupos (predicción por grupos + mejores terceros)
- [ ] Módulo Eliminatorias (bracket + lock automático -1h)
- [ ] Leaderboard (tabla ordenada por puntos)
- [ ] Resultados (listado de partidos oficiales)
- [ ] Admin Backoffice (toggles de fase + upload CSV)
- [ ] Música de fondo (MusicService — esqueleto ya listo)
- [ ] Guard de rol admin (separar acceso al panel)
- [ ] Interceptor HTTP para manejo global de errores
