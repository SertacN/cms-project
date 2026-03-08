# CMS Project

> 🚧 **In Progress** — Aktif geliştirme aşamasında.

NestJS + Angular 21 tabanlı içerik yönetim sistemi.

**Canlı:** [cms-project.sertaccan.com](https://cms-project.sertaccan.com)

---

## Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | NestJS 11, TypeScript |
| Frontend | Angular 21, Angular Material |
| Veritabanı | PostgreSQL 16 (Prisma ORM) |
| Cache | Redis 7 (cache-manager + @keyv/redis) |
| Auth | Express-session + JWT (access + refresh token) |
| Deploy | Docker, Traefik v3, GitHub Actions |

---

## Backend (NestJS)

### Mimari
- Global prefix: `/api` — tüm endpoint'ler `/api/...` ile başlar
- Prisma multi-file schema: `api/prisma/schema/` dizini, `prisma.config.ts` ile yapılandırılmış
- Winston logger + daily rotate file
- Swagger UI: `/api/docs` (sadece non-production)

### Auth
- Session tabanlı (`express-session`), cookie `httpOnly: true`
- JWT access token (15dk) + refresh token (7 gün) çifti
- Refresh token veritabanında hashed olarak saklanır
- `JwtGuard` ile korunan endpoint'ler

### Cache (Redis)
- `@nestjs/cache-manager` + `@keyv/redis` adaptörü
- TTL: `CACHE_TTL` env variable (default 30dk)
- `DELETE /api/settings/cache/clear` ile manuel temizleme

### Rate Limiting
- `@nestjs/throttler` ile global rate limiting
- Brute-force saldırılarına karşı auth endpoint'lerini korur

### Dosya Yükleme
- Multer ile dosya upload
- `uploads/` named volume — container yeniden başlatılsa bile kalıcı

---

## Frontend (Angular 21)

### Mimari
- Angular Material + CDK
- Signal tabanlı state management (servisler)
- Lazy loading ile route bazlı code splitting

### State Management — Signal vs Observable

Servislerde hangi durumda `signal`, hangi durumda `Observable` kullanıldığını açıklayan kural:

| Metod | Türü | Yaklaşım |
|-------|------|----------|
| `loadCategories()` | Paylaşılan liste state | Signal ✅ |
| `getCategoryDetails()` | Tek seferlik fetch (dialog açılınca) | Observable ✅ |
| `createCategory()` | Mutation | Observable ✅ |
| `editCategory()` | Mutation | Observable ✅ |
| `deleteCategory()` | Mutation | Observable ✅ |

**Kural:**
- Birden fazla bileşenin okuyabileceği, zaman içinde değişen, persist olan veri → **Signal**
- Bir kullanıcı aksiyonuna bağlı, tek seferlik, geçici sonuç → **Observable**

Mutation metodları (`create`, `edit`, `delete`) Observable döner. Caller `subscribe({ next, error })` ile sonucu handle eder, ardından `loadCategories()` çağrısı tetiklenerek asıl state güncellenir.

### Environment
Angular build-time environment kullanıyor (`environments/` klasörü). `.env` desteklenmez (browser runtime).
- `environment.ts` → production config, git'te yok
- `environment.development.ts` → dev config, git'te yok
- Referans: `environment.ts.example`

---

## Geliştirme Ortamı (Local)

### Gereksinimler
- Docker Desktop

### Başlatma
```bash
docker compose -f docker-compose.dev.yml up --build
```

Servisler:
- `localhost:4200` → Angular (hot-reload)
- `localhost:3000/api` → NestJS (watch mode)
- `localhost:5432` → PostgreSQL
- `localhost:6379` → Redis

### Migration Workflow
```bash
# 1. Schema değiştikten sonra diff al
docker exec cms_project_api npx prisma migrate diff \
  --from-config-datasource \
  --to-schema prisma/schema \
  --script

# 2. SQL'i api/prisma/migrations/<timestamp>_<isim>/migration.sql dosyasına kaydet

# 3. Uygula
docker exec cms_project_api npx prisma migrate deploy

# 4. Client'ı yenile (Docker + local)
docker exec cms_project_api npx prisma generate
cd api && npx prisma generate
```

---

## Production Deploy

### Altyapı
- Traefik v3 reverse proxy + Let's Encrypt SSL (otomatik)
- `traefik-net` external network üzerinden servisler Traefik'e açılır
- `cms-internal` bridge network ile servisler birbirine izole bağlanır

### CI/CD (GitHub Actions)
`main` branch'e push → otomatik deploy:
1. SSH ile VPS'e bağlanır
2. `git pull origin main`
3. `docker compose --env-file api/.env up -d --build`
4. `docker exec cms_project_api npx prisma migrate deploy`
5. `docker image prune -f`

### Gerekli GitHub Secrets
| Secret | Açıklama |
|--------|----------|
| `VPS_HOST` | VPS IP adresi |
| `VPS_SSH_KEY` | Private SSH key |

---

## Komutlar

```bash
# API
cd api
npm run start:dev      # watch mode
npm run build          # production build
npm run lint           # eslint fix
npx prisma studio      # DB GUI (DATABASE_URL=localhost gerekir)

# Client
cd client
npm start              # ng serve
npm run build          # production build
```
