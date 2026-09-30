# Shamba Direct — Farmer-Buyer Marketplace

A full-stack scaffold: a Node/Express/MongoDB API plus a React frontend
with two distinct interfaces — the public marketplace (farmers + buyers)
and a separate admin panel.

## Roles

- **Farmer** — creates produce listings, manages incoming orders.
- **Buyer** — browses approved listings, places orders, tracks status.
- **Admin** — approves/rejects listings, manages user accounts, views
  order and revenue stats. Admin accounts are never created via public
  signup — see the seed script below.

## Backend setup

```
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET
npm run dev                # starts on http://localhost:5000
```

Create the first admin account (run once, after MongoDB is reachable):

```
node seedAdmin.js
```

By default this creates `admin@farmermarketplace.com` / `ChangeMe123!` —
override with `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`
env vars, and change the password after first login.

### API overview

| Area   | Route                         | Who               |
|--------|-------------------------------|-------------------|
| Auth   | `POST /api/auth/register`     | public (farmer/buyer only) |
| Auth   | `POST /api/auth/login`        | public            |
| Auth   | `GET /api/auth/me`            | logged in         |
| Products | `GET /api/products`         | public (approved only) |
| Products | `POST /api/products`        | farmer            |
| Products | `PUT/DELETE /api/products/:id` | owning farmer  |
| Orders | `POST /api/orders`            | buyer             |
| Orders | `GET /api/orders/mine`        | buyer             |
| Orders | `GET /api/orders/incoming`    | farmer            |
| Orders | `PATCH /api/orders/:id/status`| owning farmer     |
| Admin  | `/api/admin/stats`, `/users`, `/products`, `/orders` | admin only |

## Frontend setup

```
cd frontend
npm install
npm run dev                # starts on http://localhost:5173, proxies /api to :5000
```

- `/` — public marketplace (browse + order)
- `/login`, `/register` — auth
- `/farmer/listings`, `/farmer/orders` — farmer-only
- `/orders` — buyer-only order history
- `/admin/*` — admin-only panel with its own layout (listing review queue,
  user management, order oversight, stats)

## Notes / next steps

- Image upload for listings is stubbed as a plain `images: [String]` array
  (URLs) — wire up S3/Cloudinary if you need real uploads.
- Payments aren't implemented; orders currently track status only
  (placed → confirmed → shipped → delivered).
- Add refresh tokens / rate limiting before production use.
