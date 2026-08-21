# DealFlow CRM

A lightweight, full-stack CRM for managing sales pipelines, contacts, and activities. Built with Next.js 16, Supabase, and TypeScript.

**[Live Demo](https://dealflow-crm-eta.vercel.app)** · **[Portfolio](https://mark1anthony.github.io/mark-portfolio/)**

> **Guest access:** the login page has a **"Browse as demo user"** button — no
> sign-up needed. It signs in a prepared account and loads sample data on first
> visit. The account is an ordinary user, so Row Level Security applies to it
> like to any other: it only ever sees its own rows.

---

## What it does

- **Contacts** — Create, edit, search, and manage contacts with company, email, phone, and notes
- **Deal Pipeline** — Kanban board with drag-and-drop. Move deals between stages (Lead → Qualified → Proposal → Won)
- **Activities** — Log calls, emails, meetings, and tasks against contacts or deals
- **Notes** — Attach notes to any contact or deal
- **Dashboard** — KPI cards (contacts, active deals, pipeline value, weekly activities) + pipeline summary + activity feed
- **Settings** — Customize pipeline stages with names and colors
- **Demo Data** — One-click seed button populates the app with realistic sample data

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Next.js 16** (App Router) | Server Components + Server Actions for zero-API-boilerplate CRUD |
| Language | **TypeScript** (strict) | Type safety across the full stack, Zod for runtime validation |
| Auth | **Supabase Auth** | Email/password with middleware guard, session via cookies |
| Database | **PostgreSQL** (Supabase) | 7 tables, foreign keys, CHECK constraints, indexes |
| Security | **Row Level Security** | Every table has RLS policies. Users can only see their own data |
| Drag & Drop | **@hello-pangea/dnd** | Maintained fork of react-beautiful-dnd, optimistic updates with rollback |
| Styling | **Tailwind CSS** | Utility-first, dark theme, responsive |
| Deployment | **Vercel** | Edge middleware, automatic deployments from GitHub |
| CI | **GitHub Actions** | Type check + tests + build on every push |

## Architecture

```
src/
├── app/
│   ├── (auth)/login/          # Public login/signup page
│   ├── (auth)/auth/callback/  # Supabase OAuth/email callback
│   ├── (app)/                 # Authenticated routes (sidebar layout)
│   │   ├── dashboard/         # KPIs + pipeline summary + activity feed
│   │   ├── contacts/          # List, detail, create, edit
│   │   ├── deals/             # Kanban board, detail, create, edit
│   │   ├── activities/        # Filterable activity feed
│   │   └── settings/          # Pipeline stage editor
│   └── api/deals/[id]/stage/  # PATCH endpoint for moving a deal between stages
├── components/
│   ├── ui/                    # Reusable primitives (Button, Input, Card, Modal)
│   ├── KanbanBoard.tsx        # Client component with DnD
│   ├── Sidebar.tsx            # Navigation with active state
│   └── ...                    # ContactForm, DealForm, ActivityFeed, etc.
├── lib/
│   ├── queries/               # Server-side data fetching (contacts, deals, etc.)
│   ├── actions/               # Server Actions for mutations (create, update, delete)
│   ├── __tests__/             # Vitest suites: validation, utils, server actions
│   ├── supabase-server.ts     # Authenticated Supabase client (cookie-based)
│   ├── supabase-browser.ts    # Browser-side Supabase client
│   ├── types.ts               # All TypeScript interfaces
│   ├── utils.ts               # Formatting helpers (currency, dates)
│   └── validation.ts          # Zod schemas for every form
├── test/                      # Vitest setup (jsdom, jest-dom matchers)
└── middleware.ts               # Auth guard: redirect unauthenticated users to /login
```

### Database Schema

7 tables with Row Level Security on every table:

```
pipeline_stages  ←──  deals  ──→  contacts
                        │              │
                      notes          notes
                        │              │
                    activities     activities
                                      │
                                 contact_tags  ──→  tags
```

All tables include `user_id` FK to `auth.users` with `ON DELETE CASCADE`. RLS policies ensure `user_id = auth.uid()` on every operation.

## Local Setup

```bash
# Clone
git clone https://github.com/Mark1Anthony/dealflow-crm.git
cd dealflow-crm

# Install
npm install --legacy-peer-deps

# Environment
cp .env.example .env.local
# Fill in your Supabase project URL and anon key

# Database
# Run supabase/migrations/001_initial_schema.sql in your Supabase SQL Editor

# Dev server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=       # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Your Supabase anon/public key

DEMO_USER_EMAIL=                # Optional: account behind "Browse as demo user"
DEMO_USER_PASSWORD=             # Optional: read server-side only
```

Without the two `DEMO_USER_*` values the guest button stays visible but
reports that demo access is not configured on this deployment.

## Testing

```bash
npm test          # Run all tests
npm run test:watch # Watch mode
```

Vitest, with jsdom for the component suites:

| Suite | Covers |
|---|---|
| `lib/__tests__/validation.test.ts` | Zod schemas for every form |
| `lib/__tests__/utils.test.ts` | Formatters, including unparsable dates |
| `lib/__tests__/actions.test.ts` | Every server action against a Supabase stub — above all that each one refuses to run without a session |
| `components/__tests__/` | KanbanBoard drag/optimistic update/rollback, ContactForm validation and submit |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npx tsc --noEmit` | Type check |

## License

MIT

---

Built by [Mark Amaechi](https://mark1anthony.github.io/mark-portfolio/)
