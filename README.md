# trabajo-practico-integrador-3

API REST de usuarios, eventos y categorías con Express, MongoDB y Mongoose.
Autenticación con JWT en cookie `httpOnly`, contraseñas con bcrypt y validaciones con express-validator.

## Instalación

```bash
npm install
cp .env.example .env   # completar MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN y PORT
npm run dev
```

## Endpoints

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | /api/auth/register | público |
| POST | /api/auth/login | público |
| GET | /api/auth/profile | autenticado |
| PUT | /api/auth/profile | autenticado |
| POST | /api/auth/logout | autenticado |
| GET | /api/users | admin |
| GET | /api/users/:id | admin |
| PUT | /api/users/:id | admin |
| DELETE | /api/users/:id | admin (lógico + cascada de eventos) |
| POST | /api/events | autenticado |
| GET | /api/events | autenticado |
| GET | /api/events/my | autenticado |
| GET | /api/events/:id | autenticado |
| PUT | /api/events/:id | organizador o admin |
| DELETE | /api/events/:id | organizador o admin (físico) |
| POST | /api/categories | admin |
| GET | /api/categories | autenticado |
| GET | /api/categories/:id | autenticado |
| PUT | /api/categories/:id | admin |
| DELETE | /api/categories/:id | admin (cascada: se quita de los eventos) |

## Relaciones

- 1:1 embebida: User ↔ profile, Event ↔ location.
- 1:N referenciada: User → Event (`organizer`), con virtual populate `events` en User.
- N:M referenciada: Event ↔ Category (`categories`), con virtual populate `events` en Category.
