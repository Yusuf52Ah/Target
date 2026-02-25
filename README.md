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

- `/` — Landing
- `/mutaxassislar` — Mutaxassislar ro'yxati + filter
- `/profil/[username]` — Mutaxassis profili + portfolio + buyurtma formasi
- `/dashboard` — Shaxsiy kabinet (hamyon/statistika/profil)
- `/buyurtmalar` — Buyurtmalar boshqaruvi + statuslar
- `/xabarlar` — Ichki chat (MVP)
- `/login` / `/register` — Auth sahifalari
- `/admin` — Boshqaruv paneli

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
npm run dev
```

## Vercel deploy

1. GitHub repository'ni Vercel'ga ulang.
2. Vercel Project Settings ichida `.env.example` dagi barcha `ENV`larni kiriting.
3. Build command: `npm run build`
4. Install command: `npm install`
5. Deploy qiling.

Tavsiya: Vercel’da `DATABASE_URL` uchun Neon/Supabase PostgreSQL ishlatish, Cloudinary kalitlarini Production va Preview uchun alohida saqlash.
# Target
