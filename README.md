# Web Works India — website + CRM

Node.js (Express) + PostgreSQL. Public site in `public/`, CRM at `/crm/`, API in `server.js`.

## Render (Web Service, Free instance)
Build: `npm install` · Start: `npm start` · Health check: `/healthz`

| Env variable | Value |
|---|---|
| DATABASE_URL | Neon.tech connection string |
| JWT_SECRET | long random text |
| ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME | first admin login (created on first start) |
| SITE_URL | e.g. https://webworksindia.in |
| BREVO_API_KEY / MAIL_FROM | optional: password-reset emails + new-lead alerts |
| NOTIFY_EMAIL | optional: email that gets every new website enquiry |
| NODE_VERSION | 20 |

Forgot admin password: set a new ADMIN_PASSWORD, add ADMIN_RESET=1, deploy once, then remove ADMIN_RESET.

## Editing the website
Content (services, phone, address) lives in `build.py`. Edit, run `python3 build.py`, commit, push.
