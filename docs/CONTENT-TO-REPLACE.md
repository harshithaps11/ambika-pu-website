# Content that must be replaced before launch

**Everything on the site today is placeholder content.** It is structured
exactly like the real thing so the site can be reviewed and demonstrated, but
none of it has been confirmed with the college.

The old website (`www.ambikapucollege.edu.in`) could not be read while this was
built — the development environment's network policy blocked the host — so the
few facts below that are not invented came from public directory listings and
still need checking against the college's own letterhead.

Replace everything in this document before the site goes live. Nearly all of it
is editable from the admin panel; the file paths are only for the handful of
values that live in code.

---

## 1. Facts taken from directory listings — confirm these

Found on a Careers360 listing for "Ambika Pre-University College, Nellikatte,
Puttur". Treat as unverified.

| Field | Current value | Where to change |
|---|---|---|
| Address | Ramakrishna Ashram Road, Nellikatte, Puttur, Dakshina Kannada 574201 | Admin → Campus Settings, and `src/config/site.ts` |
| Trust | Nattoja Foundation Trust | `src/config/site.ts` |
| Established | 2014 | `src/config/site.ts`, Admin → Campus Settings |
| Streams | PCM, PCB, Commerce | Admin → Courses |

---

## 2. Invented outright — must be replaced

### The second campus

The quotation and the brief both describe **two branches**, but no second
campus could be verified. A campus called **"Ambika Padavi Poorva College,
Bappalige"** was created so the two-campus structure could be built and shown.
Its name, location, establishment year, principal and description are all made
up.

Change it in **Admin → Campus Settings → Bappalige Campus**. To change the URL
(`/bappalige`), update the `slug` column on that row in the database:

```sql
UPDATE "Branch" SET slug = 'real-slug' WHERE slug = 'bappalige';
```

### Everything else invented

| Item | Where to change |
|---|---|
| All phone numbers (`08251 230001`, `08251 230002`) and email addresses | Admin → Campus Settings; `src/config/site.ts` for the head office |
| Principals' names and messages (Smt. Shobha Rai, Sri. Ganesh Bhat) | Admin → Campus Settings |
| All 14 faculty members | Admin → Faculty |
| All 8 toppers, their marks and the 98.2% pass rate | Admin → Toppers |
| All 12 notices and news items | Admin → News & Notices |
| Course fees (₹16,000–₹26,000), intake numbers, college codes | Admin → Courses |
| Student / staff counts in the statistics strip | `StatItem` table — see note below |
| Welcome text, management message, About, Vision & Mission | Admin → Page Content |
| All 12 chatbot answers — **especially fees, dates and timings** | Admin → Chatbot Answers |
| The 5 sample admission applications | Admin → Admissions, or delete the rows |
| Gallery albums and their photographs | Admin → Gallery |

> The statistics strip has no admin screen yet. Edit the `StatItem` table
> directly, or ask me to add a screen for it.

---

## 3. Images

Every image is a flat SVG illustration generated as a placeholder
(`public/images/campus-*.svg`). They are deliberately simple so they read as
stand-ins rather than as a real photograph of the wrong building.

Replace with real photographs of the campuses:

- **Hero slides** — `HeroSlide` table, or replace the files at the same paths
- **Album photographs** — Admin → Gallery
- **Faculty, principal and topper photographs** — the relevant admin screens

The crest in `src/components/brand/crest.tsx` is drawn from scratch (shield,
lamp, open book). If the college has an official emblem, replace that one file.

**Uploads are not built yet.** Images are referenced by web address today.
Adding an upload button needs a decision first: a folder on the server (simple,
needs a backup plan) or a service such as Cloudinary (free tier, no server
disk). Tell me which and I will add it.

---

## 4. Security checklist before launch

- [ ] Generate a real `AUTH_SECRET` (`openssl rand -base64 48`) — the seeded one is for development only
- [ ] Change both seeded passwords; they are published in the README
- [ ] Rename the seeded owner account to the real owner's email
- [ ] Create one account per staff member rather than a shared office login
- [ ] Confirm the database password is not the development one
- [ ] Set up the nightly backup from `docs/DEPLOYMENT.md`

---

## 5. Legal and compliance

The admission form collects personal data about minors — names, dates of
birth, phone numbers, addresses, exam results. Before launch the college
should have:

- [ ] A privacy notice saying what is collected, why, and how long it is kept
- [ ] A decision on how long applications are retained
- [ ] Agreement on who may export the data (the **Export applications**
      permission is deliberately separate for this reason)

No page has been written for this yet because the wording has to be the
college's own. Say the word and I will add a privacy page driven by Page
Content so they can edit it themselves.
