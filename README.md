# Admin panel — Vue 3 + Vite (uyimiz-backend bilan ishlaydi)

Bu frontend endi o'zining backendiga ega emas — u loyihaning yagona backendi, **`uyimiz-backend`** (Django + DRF) ga ulanadi. Xuddi shu backendga mobil ilova (`Uyimiz.uz_app`) va Uyimiz Agent paneli (`Uyimiz.uz_Biznes`) ham ulanadi — bitta manzillar jadvali, bitta baza.

## Loyiha tuzilishi

```
.
├── src/
│   ├── api.js           # uyimiz-backend bilan gaplashuvchi fetch-wrapper (Token auth)
│   ├── store/index.js   # Reaktiv holat + backend maydon nomlarini moslashtiruvchi (adapter) funksiyalar
│   ├── router/, views/, components/
└── vite.config.js       # dev serverda /api -> uyimiz-backend proksisi
```

## Ishga tushirish (ikkita terminalda)

**1-terminal — backend (repo ildizidagi `uyimiz-backend/`):**
```bash
cd ../uyimiz-backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Server `http://127.0.0.1:8000` da ishga tushadi.

**2-terminal — bu frontend:**
```bash
npm install
npm run dev
```
Brauzerda `http://localhost:5175` manzilini oching (dev serverdagi `/api` so'rovlari avtomatik `127.0.0.1:8000` ga proksilanadi).

Kirish — admin yoki superadmin roli bilan yaratilgan foydalanuvchining **telefon raqami va paroli** orqali amalga oshadi (`/api/auth/login/`).

> Agar backend boshqa manzilda ishlasa: `VITE_API_TARGET=http://boshqa-manzil:8000 npm run dev`.

## Production build

```bash
npm run build
npm run preview
```
Bunda ham `uyimiz-backend` alohida ishga tushirilgan bo'lishi kerak (masalan `gunicorn` orqali) va prod muhitda `/api` shu backendga yo'naltirilishi kerak (reverse-proxy: nginx va h.k.).

## API endpointlar (uyimiz-backend, `/api/admin/...`)

| Resurs        | Metodlar |
|---------------|----------|
| `/api/admin/users/`            | `GET`, `POST`, `PUT /:id/`, `PATCH /:id/toggle-block/`, `DELETE /:id/` |
| `/api/admin/agents/`           | `GET`, `POST`, `PUT /:id/`, `PATCH /:id/approve\|reject\|revoke/`, `DELETE /:id/` |
| `/api/admin/posts/`            | `GET`, `POST`, `PUT /:id/`, `PATCH /:id/approve\|reject/`, `DELETE /:id/` |
| `/api/admin/moderation/`       | `GET`, `PATCH /:id/approve\|reject/` |
| `/api/admin/tariffs/`          | `GET`, `PUT /:id/` |
| `/api/admin/settings`          | `GET`, `PUT` |
| `/api/admin/audit`             | `GET` |
| `/api/admin/dashboard`         | `GET` — statistikalar (jami foydalanuvchi, faol agentlar va h.k.) |
| `/api/auth/login/`             | `POST` — barcha rollar uchun umumiy login (`{phone, password}`) |

Backend snake_case maydon nomlarini ishlatadi (masalan `certification`, `total_deals`, `commission_rate`, `ai_threshold`); bu eski (mock) UI kutgan nomlar bilan `src/store/index.js` ichidagi `normalize*`/backend-field xarita funksiyalari orqali moslashtiriladi — view fayllarga tegilmagan.

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

- `src/store/index.js` — umumiy reaktiv holat + backend bilan ishlaydigan action funksiyalar + maydon moslashtiruvchilar
- `src/api.js` — fetch asosidagi API klient (Token auth, `/api/admin` va `/api/auth` bazalari)
- `src/router/index.js` — sahifalar orasidagi yo'nalish (vue-router)
- `src/components/` — Sidebar, Icon, Toast
- `src/views/` — har bir sahifa: Dashboard, Users, Agents, Posts, Moderation, Tariffs, Roles, Settings, Audit
