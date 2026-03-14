# TargetUZ MVP

Instagram / Meta Ads target mutaxassislari uchun O'zbekiston bozoriga mos freelance marketplace.

## Texnologiyalar

- Next.js (App Router)
- TypeScript (strict)
- Prisma ORM + PostgreSQL
- NextAuth (Email + Google OAuth)
- Tailwind CSS
- Zod
- Server Actions + API Routes
- Cloudinary upload imzosi

## Asosiy sahifalar

- `/` вЂ” Landing
- `/mutaxassislar` вЂ” Mutaxassislar ro'yxati + filter
- `/profil/[username]` вЂ” Mutaxassis profili + portfolio + buyurtma formasi
- `/dashboard` вЂ” Shaxsiy kabinet (hamyon/statistika/profil)
- `/buyurtmalar` вЂ” Buyurtmalar boshqaruvi + statuslar
- `/xabarlar` вЂ” Ichki chat (MVP)
- `/login` / `/register` вЂ” Auth sahifalari
- `/admin` вЂ” Boshqaruv paneli

## MVP oqimlari

### Buyurtma oqimi

1. Mijoz profil sahifasida **Buyurtma berish** formasini yuboradi.
2. Buyurtma holati: `KUTILMOQDA`.
3. Mutaxassis buyurtmani `QABUL_QILINDI` yoki `BEKOR_QILINDI` ga o'tkazadi.
4. Ish tugaganda buyurtma `YAKUNLANDI` holatiga o'tadi.

### Escrow to'lov oqimi

1. Mijoz hamyonni `Payme` yoki `Click` orqali to'ldiradi.
2. Buyurtma uchun to'lov `ESCROW_HOLD` tranzaksiya bilan ushlab turiladi.
3. Buyurtma yakunlangach escrow yechiladi.
4. Komissiya (10-15%) platformaga, qolgan summa mutaxassis hamyoniga o'tadi.

## Prisma

`prisma/schema.prisma` ichida quyidagilar bor:

- `User`, `Profile`, `Skill`, `SpecialistSkill`
- `Portfolio`, `Review`
- `Order`, `Message`
- `Wallet`, `Transaction`
- NextAuth uchun `Account`, `Session`, `VerificationToken`

## Ishga tushirish

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Prod tekshiruv uchun:

```bash
npm run check
```

## Vercel deploy

1. GitHub repository'ni Vercel'ga ulang.
2. Vercel Project Settings ichida `.env.example` dagi barcha `ENV`larni kiriting.
3. Build command: `npm run build`
4. Install command: `npm install`
5. Deploy qiling.

Tavsiya: VercelвЂ™da `DATABASE_URL` uchun Neon/Supabase PostgreSQL ishlatish, Cloudinary kalitlarini Production va Preview uchun alohida saqlash.
# Arxitektura (Feature-First)

- `features/*` вЂ” domen bo'yicha action va UI komponentlar
- `shared/ui` вЂ” umumiy UI atomlari
- `shared/layout` вЂ” umumiy layout qismlari
- `shared/types` вЂ” cross-feature turlar
- `lib/*` вЂ” infrastructura (auth, prisma, payments, validations, query helpers)

## Backend Tayyorlik

- `proxy.ts` orqali route himoyasi (`/dashboard`, `/buyurtmalar`, `/xabarlar`, `/admin`)
- API write endpointlarda rate limiting (`/api/orders`, `/api/payments/hold`, `/api/payments/release`, `/api/upload/imzo`)
- Escrow biznes qoidalari server tomonda qat'iy tekshiriladi:
  - faqat mos statuslarda hold/release
  - escrow summasi buyurtma byudjeti bilan mos bo'lishi shart
  - release faqat `YAKUNLANDI` holatida
- Cloudinary imzo endpointi faqat `SPECIALIST`/`ADMIN` uchun

## Health Check Endpointlar

- `GET /api/health` вЂ” servis holati
- `GET /api/health/db` вЂ” DB ulanish holati (`503` qaytaradi agar DB down bo'lsa)

## Muhim ENV O'zgaruvchilar

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `EMAIL_SERVER`
- `EMAIL_FROM`
- `NEXT_PUBLIC_SITE_URL`
- `PLATFORM_ACCOUNT_EMAIL` (platforma komissiya hamyoni uchun texnik admin email)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`# Target
# Target
# Target
