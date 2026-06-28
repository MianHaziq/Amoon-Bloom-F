# Admin panel ↔ backend gaps

Findings from the 2026-06-28 admin/backend reconciliation. The frontend was made
to conform to the current backend contract (treated as fixed). This file records
the places where backend changes — not frontend changes — are needed to restore
or complete functionality.

## 1. Contact module is read-only (needs backend endpoints)

The admin Contact page was degraded to **list + filter + read-only detail**
because the backend only exposes:

- `GET /api/v1/contact/admin/issues` — list (page, limit, search, status), each
  row embeds the submitter `user` `{ id, fullName, email, phone, avatar, role }`.
- `POST /api/v1/contact/issue` — authenticated submit (`{ subject, message }`).

The frontend previously called these endpoints, **none of which exist**:

| Frontend expectation | Suggested backend endpoint | Purpose |
|---|---|---|
| Inbox stats cards | `GET /contact/admin/stats` → `{ total, NEW, READ, REPLIED, ARCHIVED }` | KPI + status tabs |
| Open one message | `GET /contact/admin/:id` | Detail view (currently sourced from the list row) |
| Mark read/replied/archived | `PATCH /contact/admin/:id/status` `{ status }` | Triage workflow |
| Internal note | `PATCH /contact/admin/:id/note` `{ note }` | Requires a `adminNote` column on `UserContact` |
| Delete | `DELETE /contact/admin/:id` | Remove spam |

Note: the `UserContact` model has a `status` column (default `NEW`) but **no API
to change it**, so every message shows as "New" until a status-change endpoint
exists. There is no `adminNote` column yet.

## 2. Storefront contact form — product decision needed

`features/contact/api/contact.api.ts → submit()` still posts to `POST /contact`,
which does not exist. The only submit endpoint is `POST /contact/issue`, which:

- requires authentication (identity taken from JWT), and
- requires the user to already have a phone number on their profile, and
- takes only `{ subject, message }` (name/email/phone are read from the profile).

The public marketing contact page (`app/(storefront)/(marketing)/contact`)
collects name/email/phone for (potentially anonymous) visitors, which is
incompatible with the authenticated `/contact/issue` contract. **Decision
required:** either (a) add a public `POST /contact` endpoint that accepts the
full body, or (b) gate the storefront contact form behind login and switch it to
`/contact/issue`. Left unchanged pending that decision.

## 3. Other backend gaps (informational, no frontend change made)

- **Orders:** admin can change status (`PATCH /orders/:id/status`) but cannot
  create or edit an order. No bulk actions or CSV export on any list.
- **Products/Categories:** no dedicated admin list endpoint — the admin UI reuses
  the public `GET` routes, which return everything (all regions, drafts) when a
  staff token is present. This works but couples admin listing to storefront
  routes.

## 4. Fixed on the frontend (no backend change needed)

- Banner reorder now calls `PATCH /banners/order` with `{ order: [...] }`
  (was `PATCH /banners/reorder` with `{ bannerIds }` — 404/no-op before).
- `ManagerPermission` enum now includes `ANALYTICS` and `REGIONS` to match the
  backend permission set; the Analytics nav item is gated by `ANALYTICS`.
