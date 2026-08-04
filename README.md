# Admin panel — Vue 3 + Vite + Express/SQLite backend

To'liq ishlaydigan backendga ega admin panel. Frontend (Vue 3) va backend (Express + SQLite) alohida serverlar sifatida ishlaydi va REST API orqali bog'lanadi. Ma'lumotlar `backend/data.sqlite` faylida doimiy saqlanadi (server qayta ishga tushirilsa ham yo'qolmaydi).

## Loyiha tuzilishi

```
.
├── backend/            # Express + SQLite REST API server
│   ├── db.js           #   SQLite ulanishi, jadval sxemasi, boshlang'ich (seed) ma'lumotlar
│   ├── server.js        #   Express server, marshrutlarni ulash
│   └── routes/          #   /api/users, /api/agents, /api/posts, /api/moderation,
│                        #   /api/tariffs, /api/settings, /api/audit, /api/dashboard
├── src/
│   ├── api.js           # Backend bilan gaplashuvchi fetch-wrapper (VITE_API_URL)
│   ├── store/index.js   # Reaktiv holat + backendga so'rov yuboruvchi action'lar
│   ├── router/, views/, components/  — avvalgidek
```

## Ishga tushirish (ikkita terminalda)

**1-terminal — backend:**
```bash
cd backend
npm install
npm run dev
```
Server `http://localhost:3001` da ishga tushadi va birinchi marta ishga tushganda `data.sqlite` faylini avtomatik yaratib, boshlang'ich ma'lumotlar bilan to'ldiradi.

**2-terminal — frontend:**
```bash
npm install
npm run dev
```
Brauzerda `http://localhost:5173` manzilini oching. Ilova ochilganda backenddan barcha ma'lumotlarni (foydalanuvchilar, agentlar, e'lonlar va h.k.) avtomatik yuklab oladi.

> Agar backend boshqa portda yoki boshqa manzilda ishласа, frontend papkasida `.env` fayl yaratib `VITE_API_URL=http://sizning-manzil/api` deb yozing.

## Production build

```bash
npm run build
npm run preview
```
Bunda ham backend alohida (`npm start` — backend papkasida) ishga tushirilishi kerak.

## API endpointlar qisqacha

| Resurs        | Metodlar |
|---------------|----------|
| `/api/users`            | `GET`, `POST`, `PUT /:id`, `PATCH /:id/toggle-block`, `DELETE /:id` |
| `/api/agents`           | `GET`, `POST`, `PUT /:id`, `PATCH /:id/approve\|reject\|revoke`, `DELETE /:id` |
| `/api/posts`            | `GET`, `POST`, `PUT /:id`, `PATCH /:id/approve`, `DELETE /:id` |
| `/api/moderation`       | `GET`, `POST`, `PATCH /:id/approve\|reject` |
| `/api/tariffs`          | `GET`, `PUT /:id` |
| `/api/settings`         | `GET`, `PUT` |
| `/api/audit`            | `GET`, `POST` |
| `/api/dashboard`        | `GET` — statistikalar (jami foydalanuvchi, faol agentlar va h.k.) |

Har bir muhim amal (bloklash, tasdiqlash, rad etish, sozlama o'zgartirish) backendda avtomatik audit jurnaliga yoziladi.

## Strategik rejaga moslashtirilgan yangiliklar

Admin panel Uyimiz.uz strategik rejasidagi "maklersiz va makler bilan" modelga moslab yangilandi:

- **Foydalanuvchilar**: uy egasi / xaridor / **ijarachi** / agent turlari va shu bo'yicha filtr.
- **E'lonlar**: har bir e'lon endi **Sotish** yoki **Ijara** turiga ega (pastki filtr orqali ajratiladi).
- **Uyimiz Agent**: maklerlar endi 10-50% emas, **1-2% fiks komissiya** oladi; eng ko'p bitim qilgan sertifikatlangan agentlarga **"⭐ Top Makler"** belgisi qo'yiladi.
- **Tariflar**: Standart (bepul), Premium e'lon, VIP joylashuv, Onlayn shartnoma xizmati, Agent sertifikati, Agent oylik obunasi, Reklama banneri — rejadagi barcha monetizatsiya bosqichlari.
- **Sozlamalar**: platforma komissiyasi, Uyimiz Agent fiks komissiyasi, platformaning agentdan ulushi (Uber modeli), agent oylik obunasi, premium e'lon narxi va **rivojlanish bosqichi** (1-bosqich: maklersiz pilot → 2-bosqich: monetizatsiya → 3-bosqich: Uyimiz Agent integratsiyasi).
- **Boshqaruv paneli**: joriy foydalanuvchi/e'lon/bitim sonlarini rejadagi 3/6/12 oylik KPI maqsadlariga solishtiruvchi jadval.

## Tuzilma (frontend)

- `src/store/index.js` — umumiy reaktiv holat + backend bilan ishlaydigan action funksiyalar
- `src/api.js` — fetch asosidagi API klient
- `src/router/index.js` — sahifalar orasidagi yo'nalish (vue-router)
- `src/components/` — Sidebar, Icon, Toast
- `src/views/` — har bir sahifa: Dashboard, Users, Agents, Posts, Moderation, Tariffs, Roles, Settings, Audit
