# Ambika Padavi Poorva College — website

A two-campus college website with online admissions, a notice board with a
rolling headline ticker, a rule-based website assistant, and an administration
panel whose permissions the site owner controls account by account.

| | |
|---|---|
| **Main site** | `/` — institution-wide pages plus the two campus gateways |
| **Campus sites** | `/nellikatte`, `/bappalige` — each with its own pages, notices and admission form |
| **Admin panel** | `/admin` — separate sign-in, not linked from the public navigation |

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
PostgreSQL and Prisma 7.

---

## Quick start

```bash
cp .env.example .env         # then fill in DATABASE_URL and AUTH_SECRET
npm install
npx prisma migrate deploy    # create the tables
npm run db:seed              # placeholder content + the two admin accounts
npm run dev                  # http://localhost:3000
```

Generate a real `AUTH_SECRET` with:

```bash
openssl rand -base64 48
```

### Seeded sign-ins (development only — change before launch)

| Role | Email | Password |
|---|---|---|
| Owner | `owner@ambikapucollege.edu.in` | `ChangeMe@Owner2026` |
| College staff | `office@ambikapucollege.edu.in` | `ChangeMe@Office2026` |

Both are flagged to force a password change on first sign-in.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm run start` | Production build and server |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create and apply a migration in development |
| `npm run db:deploy` | Apply existing migrations (use on the server) |
| `npm run db:seed` | Insert placeholder content; safe to re-run |
| `npm run db:reset` | **Drops and recreates the database** |
| `npm run check:chatbot` | Checks that common visitor questions still reach the right answer |

---

## How the project is organised

```
src/
  app/
    (public)/        Main site: home, about, news, gallery, contact
    [branch]/        One campus site, rendered for whichever slug is in the URL
    admin/
      login/         Sign-in, outside the authenticated shell
      (panel)/       Everything behind sign-in
    api/chat/        The website assistant's endpoint
  components/
    brand/           The crest (swap for the college's own emblem)
    site/            Public-site building blocks
    admin/           Admin shell, tables, the declarative resource form
    ui/              Buttons, form controls, badges, pagination
  lib/
    auth.ts          Sessions, password hashing
    permissions.ts   The permission catalogue and every access check
    data/            Cached read queries for the public pages
    actions/         Server actions (all writes go through these)
    chatbot.ts       Answer matching for the assistant
  config/site.ts     Institution-level facts (name, trust, head-office contact)
prisma/
  schema.prisma      Database schema
  seed.ts            Placeholder content
docs/                Deployment, admin guide, and what still needs replacing
```

### Two things worth knowing before changing code

**Permissions are read from the database on every request**, not from the
session cookie (`src/lib/auth.ts`). That costs one indexed query per request
and buys the behaviour the college asked for: when the owner unticks a
permission, it stops working on that person's very next page load rather than
whenever their session happens to expire. Deactivating an account bumps
`sessionVersion`, which invalidates every token already issued to it.

**Campus URLs are a configuration choice**, not a routing rewrite. Links are
produced by `branchHref()` in `src/lib/branch-routing.ts`, and `src/proxy.ts`
rewrites a campus subdomain back onto `/{slug}`. Switching between
`/nellikatte` and `nellikatte.ambikapucollege.edu.in` is an environment
variable plus DNS — see `docs/DEPLOYMENT.md`.

---

## Documentation

- **`docs/DEPLOYMENT.md`** — putting it on a server, domain and subdomain setup, backups
- **`docs/ADMIN-GUIDE.md`** — for the college: how to use the panel, what each permission means
- **`docs/CONTENT-TO-REPLACE.md`** — every placeholder that must be replaced before launch

---

## Status

Working and verified end to end: public pages on both campuses, online
admission submission, the admin panel, the permission system, CSV export, the
news ticker, and the assistant.

Not yet built — see `docs/CONTENT-TO-REPLACE.md` for detail:

- **Direct image uploads.** Photographs are referenced by web address today.
  Adding an upload button needs a decision on where files are stored (a folder
  on the server, or a service such as Cloudinary).
- **Email notifications** when an application arrives. Needs an SMTP account
  or a service such as Resend.
- **Kannada translations.** The structure supports it; no translations exist.
