# Case-Dock

A case management system for lawyers and law chambers — built to handle how legal work actually happens: some cases belong to a single lawyer, others belong to a firm with multiple people who each need different levels of access to it. Case-Dock models that distinction properly instead of forcing everything through one flat permission model.

> **Status:** Backend complete and fully tested. Frontend in progress.

---

## What it does

- **Lawyers sign up individually**, then can optionally create or join a **chamber** — a firm/group of lawyers working together.
- **Cases belong to either a lawyer personally or a chamber** — never ambiguously both. Personal cases are private by default; chamber cases are visible and actionable based on what each chamber member is specifically permitted to do.
- **Chambers run on role + granular permissions**, not a fixed "admin/member" binary. A chamber owner can grant a specific member exactly the permissions they need — read-only access, or the ability to create/edit/delete cases, invite others, or manage the chamber itself — checked against the database on every request, never trusted from the client.
- **Every case carries a real hearing history** — not a flimsy "last date / next date" pair of fields, but an actual chronological list of hearings, so "what's the next date" is simply derived as the earliest future hearing rather than something that can drift out of sync.
- **Documents attach at the right level** — either to a case generally (an initial filing, a contract) or to a specific hearing (something relevant only to that date) — each uploaded through a real file storage integration with retry-on-failure and guaranteed cleanup.

---

## Tech Stack

**Backend**
- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL, via **Prisma ORM** (`@prisma/adapter-pg` driver adapter)
- **Session store:** Redis — refresh token storage and rotation
- **Auth:** JWT (short-lived access + long-lived refresh tokens), bcrypt password hashing
- **Validation:** Zod
- **File storage:** ImageKit (`@imagekit/nodejs`), Multer for multipart parsing
- **Email:** Nodemailer over Gmail SMTP

**Frontend** *(in progress)*
- React + Vite

---

## Architecture

Every request flows through the same pipeline:

```
Route → Auth Middleware → Access-Control Middleware → Validator → Controller → Service → Prisma → PostgreSQL
```

- **Routes** are intentionally thin — they only wire together middleware and a controller, no logic lives here.
- **Access control is resolved per-resource, not per-route.** A request touching a case doesn't know in advance whether that case is personal or chamber-owned — a single `requireCaseAccess` middleware fetches the case, checks its ownership type, and branches: a straight ownership check for personal cases, a membership + permission-array check for chamber cases. This logic lives in one place and is reused across every case, hearing, and document route rather than duplicated.
- **Services own all business logic** and are the only layer that talks to Prisma directly. Controllers stay thin — pull input, call the service, return a consistent response shape.
- **Multi-step writes that must succeed or fail together run inside Prisma transactions** — e.g. creating a chamber and its owner's membership row happens atomically, so a mid-write failure can never leave an ownerless chamber behind.
- **A single `ApiError` + centralized error-handling middleware** means every failure mode — validation, auth, not-found, forbidden — returns a consistent JSON shape, instead of each route inventing its own error format.

### Data model

```
User ──< Membership >── Chamber
  │                        │
  ├──< Case (personal)     └──< Case (chamber)
  │                                │
  └──< Document (general)          ├──< Hearing ──< Document
                                    └──< Document (case-level, no hearing yet)
```

A `Case` belongs to either a `User` (personal) or a `Chamber` (never both, never neither). A `Document` belongs to either a `Case` directly or a `Hearing` (same rule). Both are enforced in the service layer rather than with a database constraint — see [Known Trade-offs](#known-trade-offs) for why, and what the honest cost of that decision is.

---

## API Overview

| Module | Base path | Covers |
|---|---|---|
| Auth | `/api/auth` | register, verify-email, login, logout, refresh (with rotation), me, forgot/reset password |
| Chambers | `/api/chamber` | create, list mine, get by id, update, delete, discover (search + pagination), list chamber's cases |
| Membership | `/api/chamber/:chamberId` | join requests (create/list/approve/reject), member list, update member role/permissions, remove member |
| Cases | `/api/cases` | create (personal or chamber), list mine, get by id, update, delete |
| Hearings | `/api/cases/:caseId/hearings` | add hearing, list hearings, update hearing notes/date |
| Documents | `/api/cases/:caseId/documents`, `/api/cases/:caseId/hearings/:hearingId/documents` | upload, list, delete (case-level or hearing-level) |

Every route that touches a specific resource is gated by ownership or permission checks resolved against the database — nothing is trusted from the request itself.

---

## Notable engineering decisions

A few things worth calling out, since they came up as real design questions during the build rather than defaults:

- **Two-tier access control instead of one flat system.** Personal resources use a simple identity check; chamber resources use a full RBAC lookup. Rather than forcing every route through the heavier chamber-permission machinery, a single middleware inspects the resource and picks the right check automatically.
- **Hearings as their own timeline, not flat date fields.** This was a deliberate correction mid-design — an earlier version of the schema had `lastDate`/`nextDate` fields directly on `Case`, which can't represent hearing history and drifts out of sync with reality. Modeling hearings as their own related table with documents nested underneath fixed that.
- **Documents can belong to a case directly, not only to a hearing.** The initial schema required every document to attach to a hearing — which breaks for documents that exist before any hearing has happened (an initial filing, a client's ID proof). Fixed by giving `Document` two optional foreign keys instead of forcing a fake placeholder hearing into existence.
- **File uploads use disk-backed retry, not just an in-memory pass-through.** Files are staged to disk via Multer, uploaded to ImageKit with automatic retries, and cleaned up from disk regardless of whether the upload ultimately succeeds or fails — so a flaky upload doesn't require the user to re-select the file from scratch, and no temp files accumulate on failure.
- **Refresh tokens are revocable; access tokens are not — by design.** Access tokens are short-lived JWTs, verified purely by signature with no database lookup, since that's the whole point of using them on every request. Revocation (logout, password reset) works by invalidating the *refresh* token in Redis, which is checked on every token-refresh — a stolen access token expires within minutes regardless of what's revoked.

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Redis instance
- An ImageKit account
- SMTP credentials (a Gmail app password works)

### Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=your_postgres_connection_string
REDIS_URL=your_redis_connection_string

MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password

CLIENT_URL=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
EMAIL_VERIFY_SECRET=your_email_verify_secret

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Run migrations and start the server:

```bash
npx prisma migrate dev
npm run dev
```

The API is served under `/api`.

---

## Known Trade-offs

Called out here on purpose — these are scoping decisions made deliberately, not gaps that went unnoticed:

- **No database-level constraint** enforcing "exactly one owner" on `Case` (`personalOwnerId` vs `chamberId`) or `Document` (`caseId` vs `hearingId`). Both are nullable pairs enforced only in the service layer. A Postgres `CHECK` constraint would close this at the schema level; it was left out to avoid a raw-SQL migration outside Prisma's normal schema flow within the build timeline.
- **Chamber discovery doesn't exclude chambers the user has already joined or requested to join** — `/chamber/discover` returns the full searchable list regardless of the caller's existing memberships.
- **Granting a write permission (`CREATE_CASE`/`UPDATE_CASE`/`DELETE_CASE`) without `READ_CASE` produces a technically-valid but unusual state** — someone could edit a case they can't list or browse to. This is intentionally left for the permission-assignment UI to prevent (auto-including `READ_CASE` whenever a write permission is granted) rather than enforced server-side, since it's a data-entry concern rather than a security one — the access checks themselves are correct either way.

---

## Author

Built by [@404not_utkarsh](https://github.com/utkarsh-saxena271).
