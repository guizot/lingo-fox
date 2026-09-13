# 🦊 Lingo Fox — Clever Vocabulary Builder

A personal multi-language vocabulary learning and retention manager built with **Next.js**, **TypeScript**, **Neon PostgreSQL**, **Neon Auth**, **Drizzle ORM**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🎯 Product Overview

**Lingo Fox** powers your language learning through an active, spaced repetition retention loop:

> **Find a word → Save it → Learn it → Review it → Master it**

Words progress through 5 distinct learning stages:
- 🆕 **New**: Newly captured, pending first study session.
- 🌱 **Learning**: Initial practice begun, still prone to memory decay.
- 🙂 **Familiar**: Recognized when seen, but recall not consistently instant.
- 💪 **Strong**: High retention and low-effort recall over days.
- 🏆 **Mastered**: Long-term retention over extended intervals (30+ days).

---

## 🛠 Tech Stack

- **Framework**: Next.js (App Router) & React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Authentication**: Neon Auth (`@neondatabase/auth`)
- **Testing**: Node.js test runner with `npx tsx`

---

## 🚀 Getting Started

### 1. Installation

```bash
cd GRWLY
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate your credentials from the [Neon Console](https://console.neon.tech):
```env
# Neon PostgreSQL Connection String
DATABASE_URL=postgresql://user:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# Neon Auth Configuration (Project -> Branch -> Auth -> Configuration)
NEON_AUTH_BASE_URL=https://ep-sample-123456.neonauth.us-east-2.aws.neon.tech/neondb/auth
NEON_AUTH_COOKIE_SECRET=your_32_characters_secret_here
```

> **Note**: For immediate local development and evaluation without live Neon credentials, the app includes an automatic demo development session so all features, CRUD, reviews, and dashboards can be explored immediately!

### 3. Database Migrations (Drizzle ORM)

```bash
# Generate SQL migrations
npm run db:generate

# Push schema changes to Neon PostgreSQL
npm run db:push
```

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Tests

Run the full automated test suite:

```bash
npm test
```

This validates:
1. **Spaced Repetition Algorithm**: New word scheduling, correct/wrong answers, difficulty adjustments (forgot, hard, good, easy), status promotions (New → Learning → Familiar → Strong → Mastered), and demotions.
2. **Normalization & Matching**: Whitespace stripping, case-insensitivity, and recall punctuation tolerance.
3. **Vocabulary CRUD & Authorization**: Create, update, delete, duplicate detection by language, and cross-user data isolation.

---

## 📂 Project Architecture

```text
GRWLY/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx           # Email/password authentication
│   │   │   ├── signup/page.tsx          # Account registration
│   │   │   └── actions.ts               # Auth server actions
│   │   ├── (app)/
│   │   │   ├── layout.tsx               # App shell (Sidebar, Header, Language selector)
│   │   │   ├── dashboard/page.tsx       # Today's review banner, status counters, forgotten words
│   │   │   ├── vocabulary/
│   │   │   │   ├── page.tsx             # 5-column Kanban board (desktop) & tabs (mobile)
│   │   │   │   └── [id]/page.tsx        # Word detail view, examples, progress %, history
│   │   │   ├── review/
│   │   │   │   └── page.tsx             # Interactive review (Recognition & Recall)
│   │   │   ├── languages/page.tsx       # Enrolled languages and translation pairs
│   │   │   └── settings/page.tsx        # User profile & daily review goals
│   │   ├── api/
│   │   │   └── auth/[...path]/route.ts  # Neon Auth API proxy handler
│   │   ├── layout.tsx                   # Root HTML & metadata
│   │   ├── page.tsx                     # Root redirect
│   │   └── globals.css                  # Tailwind styles
│   ├── components/
│   │   ├── ui/                          # Button, Input, Dialog, Progress, Card, Badge
│   │   ├── layout/                      # Header, Sidebar, ActiveLanguageSelector, MobileNav
│   │   ├── vocabulary/                  # KanbanBoard, KanbanColumn, WordCard, AddWordModal, WordFilters
│   │   ├── review/                      # ReviewSession, RecognitionCard, RecallCard, DifficultyRating
│   │   ├── dashboard/                   # ReviewBanner, StatusDistribution, DueWordsList, ForgottenWordsCard
│   │   └── language/                    # LanguageManager, AddLanguageModal
│   ├── db/
│   │   ├── schema.ts                    # Drizzle schema (8 relational tables)
│   │   └── index.ts                     # Database connection
│   ├── lib/
│   │   ├── auth/                        # Neon Auth server & client instances
│   │   ├── db/                          # Isolated data-access layer (vocabulary, reviews, languages)
│   │   ├── spaced-repetition/           # Deterministic spaced repetition algorithm & unit tests
│   │   └── utils.ts                     # Normalization & date utilities
│   ├── actions/                         # Server actions (vocabulary, languages, reviews)
│   └── types/                           # Domain TypeScript types
```

---

## 🔒 Security & Authorization

All data queries and mutations derive ownership directly from the server-side authenticated session via `requireUser()`. Client-submitted IDs are never trusted blindly, preventing unauthorized access across user boundaries.
