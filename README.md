# Case-Dock

A case management system for lawyers and law chambers — built to handle how legal work actually happens: some cases belong to a single lawyer, others belong to a firm with multiple people who each need different levels of access to it. Case-Dock models that distinction properly instead of forcing everything through one flat permission model.

> **Status:** Backend complete and fully tested. Frontend is functionally complete — auth, chambers, membership/join-request review, cases, hearings, and document upload are all wired end to end against the API.

---

## What it does

- **Lawyers sign up individually**, then can optionally create or join a **chamber** — a firm/group of lawyers working together.
- **Cases belong to either a lawyer personally or a chamber** — never ambiguously both. Personal cases are private by default; chamber cases are visible and actionable based on what each chamber member is specifically permitted to do.
- **Chambers run on role + granular permissions**, not a fixed "admin/member" binary. A chamber owner can grant a specific member exactly the permissions they need — read-only access, or the ability to create/edit/delete cases, invite others, or manage the chamber itself — checked against the database on every request, never trusted from the client.
- **Every case carries a real hearing history** — not a flimsy "last date / next date" pair of fields, but an actual chronological list of hearings, so "what's the next date" is simply derived as the earliest future hearing rather than something that can drift out of sync.
- **Documents attach at the right level** — either to a case generally (an initial filing, a contract) or to a specific hearing (something relevant only to that date) — each uploaded through a real file storage integration with retry-on-failure and guaranteed cleanup.
- **Sessions are single-active-session by design** — logging in on a new device pushes a `FORCE_LOGOUT` event over WebSocket to any other connected session and revokes its refresh token immediately.

---

## Tech Stack

**Backend**
- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL, via **Prisma ORM** (`@prisma/adapter-pg` driver adapter)
- **Session store:** Redis — refresh token storage and rotation
- **Realtime:** raw `ws` WebSocket server, token-authenticated post-connection, used for single-session force-logout
- **Auth:** JWT (short-lived access + long-lived refresh tokens), bcrypt password hashing
- **Validation:** Zod
- **File storage:** ImageKit (`@imagekit/nodejs`), Multer for multipart parsing
- **Email:** Nodemailer over Gmail SMTP

**Frontend**
- React 19 + Vite + TypeScript
- Redux Toolkit for state (slices + async thunks per domain: auth, chamber, membership, case, hearing, document)
- React Router 7, with route-level code splitting (`lazy`) and a `ProtectedRoute` guard
- Axios with a single shared in-flight refresh — parallel 401s trigger one `/auth/refresh` call, not one per request
- Tailwind CSS v4

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

## Frontend Overview

| Area | Pages | Notes |
|---|---|---|
| Auth | Login, Register, Verify Email, Forgot/Reset Password | Standard flow, all against the real API |
| Chambers | List, Create, Discover (search + pagination), Details, Edit, Edit Member | Chamber details page includes inline join-request review with per-request permission assignment |
| Cases | List, Create, Details | Case details is the hub page — hearings (add/edit) and documents (case- and hearing-level upload, list, delete) are all managed inline here rather than on separate routes |
| Realtime | `SocketListener` | Listens for `FORCE_LOGOUT` and clears local session state when another login invalidates this one |

---

## Notable engineering decisions

A few things worth calling out, since they came up as real design questions during the build rather than defaults:

- **Two-tier access control instead of one flat system.** Personal resources use a simple identity check; chamber resources use a full RBAC lookup. Rather than forcing every route through the heavier chamber-permission machinery, a single middleware inspects the resource and picks the right check automatically.
- **Hearings as their own timeline, not flat date fields.** This was a deliberate correction mid-design — an earlier version of the schema had `lastDate`/`nextDate` fields directly on `Case`, which can't represent hearing history and drifts out of sync with reality. Modeling hearings as their own related table with documents nested underneath fixed that.
- **Documents can belong to a case directly, not only to a hearing.** The initial schema required every document to attach to a hearing — which breaks for documents that exist before any hearing has happened (an initial filing, a client's ID proof). Fixed by giving `Document` two optional foreign keys instead of forcing a fake placeholder hearing into existence.
- **File uploads use disk-backed retry, not just an in-memory pass-through.** Files are staged to disk via Multer, uploaded to ImageKit with automatic retries, and cleaned up from disk regardless of whether the upload ultimately succeeds or fails — so a flaky upload doesn't require the user to re-select the file from scratch, and no temp files accumulate on failure.
- **Refresh tokens are revocable; access tokens are not — by design.** Access tokens are short-lived JWTs, verified purely by signature with no database lookup, since that's the whole point of using them on every request. Revocation (logout, password reset, or a login from another device) works by invalidating the *refresh* token in Redis and pushing a `FORCE_LOGOUT` over WebSocket — a stolen access token expires within minutes regardless of what's revoked.
- **The frontend shares one in-flight refresh across parallel 401s.** If five requests fail with 401 at once, only one `/auth/refresh` call is fired; the other four wait on the same promise and retry with the new token once it resolves, instead of racing four separate refreshes against the single-use rotation in Redis.

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Redis instance
- An ImageKit account
- SMTP credentials (a Gmail app password works)

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see `backend/.env.example`):

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

The API is served under `/api`. A WebSocket server for session events is attached to the same HTTP server at `/ws`.

### Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Then run:

```bash
npm run dev
```

---

## Known Trade-offs

Called out here on purpose — these are scoping decisions made deliberately, not gaps that went unnoticed:

- **No database-level constraint** enforcing "exactly one owner" on `Case` (`personalOwnerId` vs `chamberId`) or `Document` (`caseId` vs `hearingId`). Both are nullable pairs enforced only in the service layer. A Postgres `CHECK` constraint would close this at the schema level; it was left out to avoid a raw-SQL migration outside Prisma's normal schema flow within the build timeline.
- **Chamber discovery doesn't exclude chambers the user has already joined or requested to join** — `/chamber/discover` returns the full searchable list regardless of the caller's existing memberships.
- **Granting a write permission (`CREATE_CASE`/`UPDATE_CASE`/`DELETE_CASE`) without `READ_CASE` produces a technically-valid but unusual state** — someone could edit a case they can't list or browse to. This is intentionally left for the permission-assignment UI to prevent (auto-including `READ_CASE` whenever a write permission is granted) rather than enforced server-side, since it's a data-entry concern rather than a security one — the access checks themselves are correct either way.

## Known Issues (found in review, not yet fixed)

These are real gaps worth closing before this goes anywhere near production traffic — unlike the trade-offs above, these weren't deliberate:

- **Member-update endpoint allows privilege escalation.** `PATCH /chamber/:chamberId/members/:membershipId` is gated only by the `EDIT_GROUP` permission, and the service never checks whether the target row is the caller's own membership or the chamber `OWNER`'s. A member holding `EDIT_GROUP` can currently grant themselves every other permission, or strip/demote the actual owner. This needs an owner-only guard, or at minimum a check that blocks self-targeting and owner-targeting.
- **Hearing-document upload doesn't verify `hearingId` belongs to `caseId`.** `requireCaseAccess` only validates the caller's access to `:caseId`; `createHearingDocumentService` writes using `hearingId` from the URL without confirming it belongs to that case. A user with `UPDATE_CASE` on any case they control could attach a document to an arbitrary hearing ID from a case they don't otherwise have access to.
- **No rate limiting** on any route, `/auth/login` and `/auth/forgot-password` especially — currently open to brute-force and email-bombing.
- **File uploads accept any mimetype**, capped only at 10MB — no allow-list for expected document types.
- **`membership.validation.ts` references a `'DELETE_GROUP'` permission** that doesn't exist in the Prisma `Permission` enum — dead value, harmless today, but a landmine if it's ever wired up without updating the schema first.
- **Unhandled (non-`ApiError`) exceptions return `err.message` directly** in `error.middleware.ts`, which can leak internal details (e.g. raw Prisma error text) to the client in production.
- **No automated tests** — given how much of this app's correctness lives in the permission-resolution logic, this is the highest-leverage place to add coverage first.

---

## Author

Built by [@404not_utkarsh](https://github.com/utkarsh-saxena271).