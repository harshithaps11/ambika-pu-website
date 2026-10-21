# Deployment

The site is a Next.js application with a PostgreSQL database. It needs a host
that can run Node.js — a small VPS is enough and is the cheapest option that
fits the quoted hosting budget.

---

## 1. What to buy

| Item | Suggestion | Rough cost |
|---|---|---|
| Domain | `ambikapucollege.edu.in` (an `.edu.in` needs institution documents; `.ac.in`/`.org` are alternatives) | ₹1,000–1,600 / year |
| Server | 2 GB RAM VPS (Hostinger, DigitalOcean, Contabo) | ₹350–600 / month |
| TLS certificate | Let's Encrypt via Certbot | free |

Buy the domain and the server **in the college's own name and email**, not
yours. They then own the services outright, which is what the quotation says.

---

## 2. Prepare the server

Ubuntu 24.04, as root:

```bash
apt update && apt install -y nginx postgresql git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs
npm install -g pm2
```

Create the database:

```bash
sudo -u postgres psql
CREATE USER ambika WITH PASSWORD 'use-a-long-random-password';
CREATE DATABASE ambika_prod OWNER ambika;
\q
```

---

## 3. Deploy the application

```bash
git clone <your-repository> /var/www/ambika
cd /var/www/ambika
npm ci
```

Create `/var/www/ambika/.env`:

```env
DATABASE_URL="postgresql://ambika:THE-PASSWORD@127.0.0.1:5432/ambika_prod?schema=public"
AUTH_SECRET="<output of: openssl rand -base64 48>"
NEXT_PUBLIC_SITE_URL="https://ambikapucollege.edu.in"
BRANCH_ROUTING_MODE="path"
ROOT_DOMAIN="ambikapucollege.edu.in"
NODE_ENV="production"
```

Then:

```bash
npx prisma migrate deploy
npm run db:seed          # first deployment only
npm run build
pm2 start npm --name ambika -- start
pm2 save && pm2 startup
```

> The build reads the database to pre-render the home page, so `DATABASE_URL`
> must be set and the migrations applied **before** `npm run build`.

---

## 4. Nginx and TLS

`/etc/nginx/sites-available/ambika`:

```nginx
server {
    listen 80;
    server_name ambikapucollege.edu.in www.ambikapucollege.edu.in;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

`X-Forwarded-For` matters: the rate limiters on the admission form, the
contact form and the sign-in screen read it to tell visitors apart.

```bash
ln -s /etc/nginx/sites-available/ambika /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
apt install -y certbot python3-certbot-nginx
certbot --nginx -d ambikapucollege.edu.in -d www.ambikapucollege.edu.in
```

---

## 5. DNS

| Type | Name | Value |
|---|---|---|
| A | `@` | your server's IP |
| A | `www` | your server's IP |

For campus subdomains later, add either one record per campus or a wildcard:

| Type | Name | Value |
|---|---|---|
| A | `*` | your server's IP |

---

## 6. Switching campuses to subdomains

The site ships with campuses at `/nellikatte` and `/bappalige`. To move them to
`nellikatte.ambikapucollege.edu.in` instead:

1. Add the DNS records above.
2. Extend the certificate:
   ```bash
   certbot --nginx -d ambikapucollege.edu.in -d www.ambikapucollege.edu.in \
     -d nellikatte.ambikapucollege.edu.in -d bappalige.ambikapucollege.edu.in
   ```
   (Or a wildcard certificate via DNS validation if campuses will be added often.)
3. Add the subdomains to `server_name` in the nginx block.
4. In `.env` set `BRANCH_ROUTING_MODE="subdomain"` and confirm `ROOT_DOMAIN`.
5. `npm run build && pm2 restart ambika`.

No code changes are needed. `src/proxy.ts` rewrites `nellikatte.<domain>/courses`
onto `/nellikatte/courses` internally, and every generated link switches form
automatically.

**Recommendation:** stay on paths. One domain keeps all the search-engine
authority in one place, needs one certificate, and is simpler to maintain —
which is exactly why `nitte.edu.in/nmamit` is built that way.

---

## 7. Backups

A college site's real asset is the admission data. Add a nightly dump:

```bash
# /etc/cron.d/ambika-backup
0 2 * * * postgres pg_dump ambika_prod | gzip > /var/backups/ambika-$(date +\%F).sql.gz
0 3 * * * root find /var/backups -name 'ambika-*.sql.gz' -mtime +30 -delete
```

Copy those files off the server periodically — a backup that only exists on
the machine it is backing up is not a backup.

---

## 8. Updating the site later

```bash
cd /var/www/ambika
git pull
npm ci
npx prisma migrate deploy
pm2 stop ambika          # see the warning below
rm -rf .next
npm run build
pm2 start ambika
```

> **Stop the app before rebuilding.** A running server keeps writing to
> `.next` while the build replaces it. The build then succeeds but the
> prerendered pages can end up pointing at JavaScript files the new build no
> longer has, and those pages lose their interactive parts with a 404 in the
> browser console. Stopping first and clearing `.next` avoids it. The site is
> down for the ten seconds or so the build takes; if that is not acceptable
> later, build into a fresh directory and switch a symlink.
