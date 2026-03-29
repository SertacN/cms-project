# CMS Project

**Canli:** [cms-project.sertaccan.com](https://cms-project.sertaccan.com)

> 🚧 **Devam Ediyor** — Aktif gelistirme asamasinda.

## Kalan
- Media (Iceriklere dosya yukleme ve listeleme)
- Settings
- User Details
- Dashboard Canli Veri
- i18n Entegrasyonu

NestJS + Angular 21 tabanli icerik yonetim sistemi.
Kendi portfolyo sitemin icerik yonetimini yapmak icin olusturdum.

## Gelecek Hedefler
CMS tamamlandiktan sonra ERP Modulleri, CRM Modulleri gibi ozellikler eklenecek.
Not: Bu repo sadece CMS kodlarini barindiracak. Diger moduller canli demo site ile gosterilecek.
Gelistirme surecleri bu README'ye eklenecek.

### Mimari Degisiklik
Farkli moduller eklenmeden once proje mimarisi Modular Monolith yapisina gecirilecek.
Ornek:
```
src/auth/                  →  src/identity/auth/
src/contents/              →  src/cms/
src/common/guards/         →  src/_kernel/guards/
src/prisma/                →  src/_infra/prisma/
```

### Event Bus Altyapisi (BullMQ)
- Redis mevcut oldugu icin MQ servisi olarak BullMQ entegre edilecek (NestJS ile tam uyumlu)

---

## Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | NestJS 11, TypeScript |
| Frontend | Angular 21, Angular Material |
| Veritabani | PostgreSQL 16 (Prisma ORM) |
| Cache | Redis 7 (cache-manager + @keyv/redis) |
| Auth | Express-session + JWT (access + refresh token) |
| Deploy | Docker, Traefik v3, GitHub Actions |

---

## Backend (NestJS)

### Mimari
- Global prefix: `/api` — tum endpoint'ler `/api/...` ile baslar
- Prisma multi-file schema: `api/prisma/schema/` dizini, `prisma.config.ts` ile yapilandirilmis
- Winston logger + daily rotate file
- Swagger UI: `/api/docs` (sadece non-production)

### Auth
- Session tabanli (`express-session`), cookie `httpOnly: true`
- JWT access token (15dk) + refresh token (7 gun) cifti
- Refresh token veritabaninda hashed olarak saklanir
- `JwtGuard` ile korunan endpoint'ler

### Cache (Redis)
- `@nestjs/cache-manager` + `@keyv/redis` adaptoru
- TTL: `CACHE_TTL` env variable (default 30dk)
- `DELETE /api/settings/cache/clear` ile manuel temizleme

### Rate Limiting
- `@nestjs/throttler` ile global rate limiting
- Brute-force saldirilarina karsi auth endpoint'lerini korur

### Dosya Yukleme
- Multer ile dosya upload
- `uploads/` named volume — container yeniden baslatilsa bile kalici

---

## Frontend (Angular 21)

### Mimari
- Angular Material + CDK
- Signal tabanli state management (servisler)
- Lazy loading ile route bazli code splitting
- Angular CLI (ng) ile dosya olusturma islemleri

### State Management — Signal vs Observable

Servislerde hangi durumda `signal`, hangi durumda `Observable` kullanildigini aciklayan kural:

| Metod | Turu | Yaklasim |
|-------|------|----------|
| `loadCategories()` | Paylasilan liste state | Signal ✅ |
| `getCategoryDetails()` | Tek seferlik fetch (dialog acilinca) | Observable ✅ |
| `createCategory()` | Mutation | Observable ✅ |
| `editCategory()` | Mutation | Observable ✅ |
| `deleteCategory()` | Mutation | Observable ✅ |

**Kural:**
- Birden fazla bilesenin okuyabilecegi, zaman icinde degisen, persist olan veri → **Signal**
- Bir kullanici aksiyonuna bagli, tek seferlik, gecici sonuc → **Observable**

Mutation metodlari (`create`, `edit`, `delete`) Observable doner. Caller `subscribe({ next, error })` ile sonucu handle eder, ardindan `loadCategories()` cagrisi tetiklenerek asil state guncellenir.

### Environment
Angular build-time environment kullaniyor (`environments/` klasoru). `.env` desteklenmez (browser runtime).
- `environment.ts` → production config, git'te yok
- `environment.development.ts` → dev config, git'te yok
- Referans: `environment.ts.example`

### Form
- Karmasik olmayan, ekstra validation gerektirmeyen islemler icin → FormField signal modeli (Login sayfasi)
- Diger form islemleri icin → FormsModule (Dialog componentlar)
- Neden: Dialog, Input gibi alanlar icin kullanilan Material kutuphanesi yeni FormField API ile henuz uyumlu degil. Sade form islemleri icin FormField (signal-based), diger form islemleri icin FormsModule kullanildi.

---

## AI Tercihi (Claude Code)
### Kullanim Alanlari
- i18n dil donusumleri (ceviriler)
- Uygun commit mesajlari olusturma
- Test islemleri
- Refactoring islemleri (kodun dis davranisini degistirmeden ic yapisini iyilestirme)

---

### API Endpoint Kontrolleri
- Insomnia

### DB Baglanti Islemleri
- DBeaver
- Nadiren Prisma Studio (proje basinda cogunlukla Prisma Studio)

---

## Gelistirme Ortami (Local)

### Gereksinimler
- Docker Desktop

### Baslatma
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
# 1. Schema degistikten sonra diff al
docker exec cms_project_api npx prisma migrate diff \
  --from-config-datasource \
  --to-schema prisma/schema \
  --script

# 2. SQL'i api/prisma/migrations/<timestamp>_<isim>/migration.sql dosyasina kaydet

# 3. Uygula
docker exec cms_project_api npx prisma migrate deploy

# 4. Client'i yenile (Docker + local)
docker exec cms_project_api npx prisma generate
cd api && npx prisma generate
```

---

## Production Deploy

### Altyapi
- Traefik v3 reverse proxy + Let's Encrypt SSL (otomatik)
- `traefik-net` external network uzerinden servisler Traefik'e acilir
- `cms-internal` bridge network ile servisler birbirine izole baglanir

### CI/CD (GitHub Actions)
`main` branch'e push → otomatik deploy:
1. SSH ile VPS'e baglanir
2. `git pull origin main`
3. `docker compose --env-file api/.env up -d --build`
4. `docker exec cms_project_api npx prisma migrate deploy`
5. `docker image prune -f`

### Gerekli GitHub Secrets
| Secret | Aciklama |
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
