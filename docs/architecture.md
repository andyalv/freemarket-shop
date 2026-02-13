# Architecture Decision Document

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- Storefront (customer): browse/filter/sort catalog; product detail with provenance (batch/harvest) and variants; cart; checkout with required email + shipping details.
- Accounts: optional sign-in (email + Google), order history and order detail views.
- Payments: Stripe (cards) + PayPal with a strict rule that orders are persisted **only after server-side payment verification**; PayPal cancel/failure returns to checkout without creating orders.
- Orders & comms: create order identifier; show confirmation; send confirmation email; enable guest tracking via order ID lookup.
- Fulfillment: create shipments via an external shipment API for paid orders; persist shipment records + statuses + timestamps + returned metadata in Supabase; customers can view shipment status once shipment exists.
- Back-office (role/group gated routes): products/categories/variants CRUD; inventory stock per SKU/variant; orders view; shipments view with manual status updates; failed/returned shipments require reason + resolution notes/actions.
- Discounts & loyalty: temporal + loyalty discounts with stacking rules (subtotal-only) and visibility in UI.
- Support tickets (MVP simplification): no separate Support role. Ticket capture is available and visible to Admin/Management; no ticket-scoped restriction in MVP. Management remains ops-focused and cannot perform user CUD/role admin.

**Non-Functional Requirements:**
- Performance: primary screens should load/transition ≤ 2–3 seconds; avoid blank screens; include loading indicators/skeletons; clear payment processing/verification states.
- Reliability & data integrity: no silent data loss; explicit recoverability for failures; keep orders/shipments consistent; auditable shipment status transitions; explicit retry paths for external API failures.
- Security & access control: HTTPS; enforce role/group access for routes and data; no Support role in MVP (Admin/Management handle tickets); audit-log sensitive actions (role changes, shipment status changes, ticket assignment, escalations).
- Integration: Stripe test mode + PayPal sandbox for dev; do not store raw card data; persist provider IDs/status/timestamps; handle shipment API failures explicitly.

**Scale & Complexity:**
- Primary domain: full-stack web app (CSR storefront + back-office)
- Complexity level: medium (payments + shipping integration + RBAC + ops workflows)
- Key modules/components implied:
  - Catalog, Product Detail (provenance), Cart, Checkout, Payment Verification, Orders/Tracking (guest + account)
  - Admin: Products/Variants, Inventory, Orders Ops, Shipments Ops, Discounts/Loyalty, Support Tickets
  - Cross-cutting: Auth/RBAC, Audit Logging, Email Notifications, Error Handling/Observability

### Technical Constraints & Dependencies

- Next.js application with hybrid rendering (Server Components by default, Client Components for interactivity); storefront and back-office live in one app separated by route groups.
- **Supabase is the backend system of record**: authentication, row-level security (RLS) policies, database triggers, storage.
- **No separate API server**: Server Actions in Next.js call Supabase directly; Supabase RLS policies enforce authorization at the database level.
- External shipment API integration required (called from Server Actions).
- Stripe + PayPal integrations require server-side verification (via Server Actions) and strict order-creation gating.
- UX direction is desktop-first; hybrid rendering reduces blank screens; no real-time requirement for MVP.
- Payment UX must support clear processing/success/failure/cancel states and retries without losing the cart.

### Cross-Cutting Concerns Identified

- Payment state correctness and idempotency (avoid duplicate charges/orders; verify-before-create).
- Inventory consistency (prevent/handle oversell; keep cart/checkout aligned with stock).
- Shipment lifecycle as an auditable state machine (created/shipped/delivered/failed/returned + reasons/resolutions).
- Role/group authorization across routes and data access (no ticket-scoped Support access in MVP).
- Audit logging for sensitive actions and scoped data access.
- PII handling (shipping/contact) and safe handling of payment provider data (no raw card storage).
- Explicit error handling and retry workflows for external integrations (payments + shipment API) and email delivery.

## Starter Template Evaluation

### Primary Technology Domain

Web application (hybrid SSR + Client Components) with storefront + back-office route groups in a single Next.js app.

### Starter Options Considered

- **Keep current Bun SPA foundation**: Bun server + React Router CSR.
  - Pros: already in-repo; minimal churn.
  - Cons: manual server creation needed; more code for auth validation; no built-in Server Components; SEO not optimized.
- **Next.js 15 with App Router**: `npx create-next-app@latest --typescript --app`.
  - Pros: built-in Server Components + Server Actions; file-based routing; scales from MVP to production; built-in middleware for auth; Supabase integrations are well-documented; reduces boilerplate significantly.
  - Cons: requires migration from existing Bun setup.
- **Vite + React + manual server**: Similar to Bun but with Vite.
  - Pros: standard ecosystem.
  - Cons: still requires manual auth validation and API layer; no Server Components.

### Selected Starter: Next.js 15 with App Router

**Rationale for Selection:**
- **Server Components and Server Actions eliminate a separate API server layer** (Supabase RLS + Auth layer is the security boundary).
- **Hybrid rendering** (SSR by default) improves performance, SEO, and reduces blank screens vs pure CSR.
- **Supabase Auth integrates natively** with Next.js middleware for route protection + JWT validation.
- **Supabase RLS policies** enforce authorization at the database level (no manual server validation needed).
- **Database triggers** in Supabase handle audit logging and cascading updates (no manual logging code in the app).
- **Next.js middleware** provides a single place for auth/RBAC checks across routes.
- Aligns with modern full-stack patterns and reduces code complexity.

**Initialization Command:**

```bash
bun create next-app@latest --typescript --app --tailwind --eslint --git
# or
pnpm create next-app@latest --typescript --app --tailwind --eslint --git
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript + Next.js (Node.js runtime in built-in server).

**Styling Solution:**
- Tailwind CSS (built-in via next config).

**Build Tooling:**
- Next.js built-in bundler (`next build`, `next dev`, `next start`).

**Testing Framework:**
- Not defined by the starter (no test runner configured yet).

**Code Organization:**
- `src/app/` directory: file-based routing (pages/layouts). Middleware lives at `src/middleware.ts`.
- `app/api/route.ts`: optional edge-case API routes (e.g., external webhooks).
- Server Components by default; Client Components opt-in with `'use client'`.

**Server Actions (MVP Decision):**
- Server Actions live colocated with features (e.g., `app/(storefront)/checkout/actions.ts`) or centralized in `lib/actions/`.
- Server Actions call Supabase client directly; Supabase RLS policies enforce row-level authorization.
- Mutations (CRUD, payments, shipment creation) use Server Actions instead of traditional REST endpoints.
- No separate `/api` layer needed for most operations (keeps codebase lean).

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data access model: Supabase-native (Server Actions call Supabase directly; RLS policies enforce authorization).
- Input validation: Shared Zod schemas with client + Server Action validation.
- Migrations: Supabase migrations or Drizzle ORM as source of truth.

**Important Decisions (Shape Architecture):**
- Inventory handling: best-effort + guardrails (no cart reservations in MVP; handle stock changes at checkout).

**Deferred Decisions (Post-MVP):**
- Consider Supabase Edge Functions for webhook handling/scaling if needed (e.g., payment provider webhooks).

### Data Architecture

**Database & persistence:**
- Supabase Postgres is the system of record for application data.

**Access model (Supabase-native):**
- **Next.js Server Actions call Supabase directly** (no intermediate API server layer).
- Supabase client uses a **service role key** (server-side only) for privileged operations.
- Client never holds service-role credentials; browser client uses **anon key** for unauthenticated reads or user's own JWT for authenticated operations.
- **Supabase RLS policies** enforce row-level authorization at the database level—the database itself is the security boundary.
- All client-to-Supabase communication is authenticated via JWT (Supabase Auth or custom JWT).

**Data validation & RLS Policies:**
- Define shared Zod schemas used by form validation (client) and data mutation verification (Server Action).
- **Supabase RLS policies** provide the authoritative data-access control:
  - Example: Only users with `admin` role can update product inventory.
  - Example: Admin/Management users can view tickets/orders needed for operations in MVP.
  - Example: Users can only view their own orders (RLS policy on `orders` table).
- Client-side Zod validation is UX-friendly; server-side validation (via RLS + constraints) is authoritative.

**Database triggers for audit logging & side effects:**
- Supabase Postgres triggers automatically:
  - Log sensitive mutations (user role changes, shipment status updates, ticket assignments) to an `audit_log` table.
  - Set `updated_at` timestamps.
  - Cascade deletions or data consistency updates as needed.
- No manual logging code needed in the app layer.

**Migrations:**
- Use **Drizzle ORM or Supabase migrations** as the source of truth for schema changes.
- Run migrations via `supabase migration new xyz` or Drizzle CLI.
- Migrations are version-controlled and applied deterministically.

**Inventory consistency (Best-effort + guardrails):**
- Do not implement cart-level reservations in MVP.
- At checkout, verify stock using Supabase query; if stock changed, surface the change clearly and allow customer to adjust cart.
- Use Postgres transaction semantics for order creation (all-or-nothing writes).

### Authentication & Security

**Authentication:**
- Use **Supabase Auth** for email + Google sign-in.
- Supabase generates JWT tokens; tokens are stored in memory-only (no localStorage for MVP).
- **Next.js middleware** validates JWT on each request and sets user context.

**Authorization (RBAC via RLS; no Support role in MVP):**
- **JWT claims include `role` and `groups`** (set in Supabase Auth metadata or custom claims).
- **Supabase RLS policies** enforce row-level access based on role/group claims.
- **Next.js route middleware** provides a UX layer (redirect unauthorized users to login or error page).
- No Support role for MVP. Admin and Management handle tickets without ticket-scoped restrictions.
- RBAC roles: `admin`, `management` (ops), `user` (customer).

**Audit logging (via Supabase triggers):**
- Database triggers automatically log sensitive actions to an `audit_log` table:
  - User role changes
  - Shipment status updates
  - Ticket assignments
  - Escalations
- Audit log captures: user_id, action, resource_type, resource_id, old_value, new_value, timestamp.

**Secrets & environment handling:**
- All secrets remain server-side only (Next.js server environment), including:
  - Stripe secret key(s)
  - PayPal client secret
  - Supabase service role key
- Client receives public configuration via environment variables (prefixed `NEXT_PUBLIC_`):
  - Supabase public anon key
  - Supabase project URL
  - Stripe publishable key
  - PayPal client ID

### API & Communication Patterns

**Communication architecture (Server Actions):**
- **Server Actions** colocated with features (e.g., `app/(storefront)/checkout/actions.ts`) or centralized in `lib/actions/`.
- Server Actions accept FormData or JSON payloads (Next.js handles serialization).
- Server Actions perform Zod validation, call Supabase directly, and return typed responses or throw errors.
- Client-side (browser) calls Server Actions with `"use server"` directive + suspense boundaries for async data fetching.

**Payments & order creation (Two-step via Server Actions):**
- **Step 1: Verify payment** via Server Action `verifyStripePayment()` or `verifyPayPalPayment()`.
  - Calls Stripe/PayPal API to confirm payment state.
  - Creates a short-lived (TTL: 10 min) verification record in Supabase (single-use).
  - Returns verification ID to client.
- **Step 2: Create order** via Server Action `createOrder(verificationId)`.
  - Validates verification record exists and is still valid.
  - Marks verification record as "used" to prevent duplicate orders.
  - Writes order to Supabase (RLS policies ensure user can only create their own order).
  - Returns `order_id` and confirmation payload.
- **No order is persisted until Step 2 succeeds.**

**Error handling standard:**
- Server Actions throw `Error` objects with stable `code` properties (for categorization).
- Client catches errors and displays user-friendly messages.
- Do not expose sensitive details to browser; log detailed errors server-side.

**Rate limiting (MVP):**
- Implement basic rate limiting in Next.js middleware or an Edge Runtime utility for public endpoints (e.g., guest order lookup, payment verification, order creation).

### Frontend Architecture

**Routing & rendering:**
- Use **Next.js App Router** with file-based routing under `src/app/` directory.
- **Route groups** organize code: `app/(storefront)/` for customer UX, `app/(backoffice)/` for ops/admin UX.
- **Server Components by default**, with `'use client'` only for interactive UI (forms, cart, real-time updates).
- Middleware (`app/middleware.ts`) protects routes: validates JWT, redirects unauthorized users.

**Hybrid rendering:**
- **Server Components** fetch product catalogs, order history, and static content directly from Supabase (no waterfall delays).
- **Client Components** handle interactive UI: form submission, cart state, payment workflows, real-time feedback.
- Suspense boundaries provide loading states (skeleton screens per UX spec).

**State management:**
- **Server state**: Supabase is the source of truth; Server Components/Server Actions query Supabase directly.
- **Client state**: React state for ephemeral UI (cart drawer open/close, form validation feedback, loading indicators).
- **Session state**: JWT stored in memory (no localStorage for MVP); middleware extracts JWT from cookies or request context.

**UI components:**
- Use **shadcn/ui** (Radix) + Tailwind as the component foundation.
- Build custom "signature" components called out in UX spec:
  - Provenance panel (farm, harvest/batch, delivery window)
  - Tracking timeline (shipment status with exception messaging)
  - Cart drawer with real-time stock checks
  - Calm checkout flow with clear payment/processing states

**Forms:**
- Use **React Hook Form** + **Zod resolver** for client-side validation (instant UX feedback).
- **Server Actions** re-validate with the same Zod schemas (authoritative validation happens server-side).
- Forms submit directly to Server Actions; no extra API calls.

### Infrastructure & Deployment

**Hosting (MVP):**
- Deploy Next.js application to a standard Node.js host (Vercel, Netlify, Railway, self-hosted).

**Environment configuration:**
- Local development uses `.env.local`.
- Deployed environments use host-provided environment variables.
- Client reads public configuration via `NEXT_PUBLIC_*` (no secrets exposed).

**Monitoring/logging (test MVP):**
- Use basic structured logs (console) and Supabase logs for debugging.

**CI (GitHub Actions):**
- Run `bun install`, `bun run build`, and `bun run test` on pushes/PRs.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
Areas where AI agents could make different choices: database naming, TypeScript identifier casing, Server Action organization, data serialization formats, money representation, payment flow boundaries, error handling, status enums, session handling, timestamp formats.

### Naming Patterns

**Database Naming Conventions:**
- Tables: **singular** + **snake_case**.
  - Example: `order`, `order_item`, `shipment`, `product`, `product_variant`, `support_ticket`
- Columns: **snake_case**.
  - Example: `created_at`, `updated_at`, `order_id`, `user_id`, `status`, `amount_cents`
- IDs: UUID strings stored in DB (Postgres `uuid`) and serialized as strings.
  - Example: `id = '550e8400-e29b-41d4-a716-446655440000'`
- Status enums: **snake_case strings**.
  - Example: `pending_payment`, `paid`, `shipped`, `delivered`, `failed`, `returned`

**API Naming Conventions:**
- Base: `/api/...` via Next.js Route Handlers where needed (prefer Server Actions for app-owned mutations).
- Resource-first, plural nouns for collections:
  - Example: `/api/products`, `/api/orders`, `/api/shipments`
- Route params: use `:id` consistently for all ID routes.
  - Example: `/api/orders/:id`, `/api/products/:id`
- Guest tracking endpoint:
  - `/api/orders/lookup?order_id=<uuid>`
- Payments (two-step):
  - Verify: `/api/payments/stripe/verify`, `/api/payments/paypal/verify`
  - Create order: `/api/orders/create`

**JSON Field Naming Conventions:**
- All JSON request/response fields are **snake_case**.
  - Example: `order_id`, `created_at`, `amount_cents`, `user_id`, `shipping_address`

**Code Naming Conventions:**
- TypeScript identifiers: `camelCase` for variables/functions, `PascalCase` for React components and types.
- File naming: **PascalCase** for all TypeScript/TSX source files we create going forward.
  - Examples: `PaymentRoutes.ts`, `OrderService.ts`, `OrderSchemas.ts`, `ProblemDetails.ts`, `RequireRole.tsx`
- Existing files that don’t match can remain as-is for MVP; do not rename purely for style.

### Structure Patterns

**Server Action Organization:**
- Server Actions colocated with features: `app/(storefront)/checkout/actions.ts`, `app/(backoffice)/products/actions.ts`.
- Or centralized in `lib/actions/` if shared across multiple features.
- Each actions file exports multiple functions (e.g., `verifyStripePayment`, `verifyPayPalPayment`, `createOrder`).
- Server Actions marked with `'use server'` directive at file or function level.

**Schema Organization:**
- Shared Zod schemas live in `lib/schemas/` or colocated with features.
  - Example: `lib/schemas/orderSchema.ts`, `lib/schemas/paymentSchema.ts`, `lib/schemas/productSchema.ts`.
- Server Actions validate with Zod; client forms also use these schemas (React Hook Form + Zod resolver).

**Route Organization:**
- Next.js file-based routing in `src/app/` directory.
- Route groups separate concerns: `src/app/(storefront)/`, `src/app/(backoffice)/`.
- Shared layouts: `src/app/(storefront)/layout.tsx`, `src/app/(backoffice)/layout.tsx`.
- Middleware (`src/middleware.ts`) protects routes; validates JWT and enforces role-based access.

### Route Colocation Policy

Route-local implementation (components, hooks, utilities, schemas, and Server Actions used only by a single route) must live alongside that route in `src/app/...`.

- Colocate per route/segment: put UI components, hooks, helpers, and `actions.ts` files in the same route directory that consumes them.
- Only place truly reusable, cross-route pieces in `src/components/` (shared UI primitives) and `src/lib/` (shared logic/services/schemas).
- Benefits: clearer ownership, simpler imports, and less cross-feature coupling.

Examples:
- `src/app/(storefront)/checkout/CheckoutForm.tsx` (route-local component)
- `src/app/(storefront)/checkout/actions.ts` (Server Actions used only by checkout)
- Shared button lives in `src/components/ui/button.tsx`; shared email service in `src/lib/services/emailService.ts`.

### Format Patterns

**API Response Formats:**
- Success responses: JSON objects with snake_case fields.
- Errors: RFC 7807 Problem+JSON **minimal required fields only**:
  - Required: `type`, `title`, `status`
  - Optional: `detail`, `instance`
- Problem+JSON extensions (allowed, but consistent):
  - `code`: stable machine-readable code (snake_case)
  - `fields`: per-field validation errors (snake_case keys)
  - `request_id`: correlation id when available

**HTTP Status Code Standards (examples):**
- `200`/`201`: success
- `400`: validation errors (Zod)
- `401`: unauthenticated
- `403`: authenticated but forbidden (RBAC/ticket scope)
- `404`: not found
- `409`: conflict (e.g., stock changed, duplicate create)
- `429`: rate limited
- `500`: unexpected

**Date/Time Formats:**
- All timestamps are **ISO 8601 UTC**.
  - Example: `created_at: "2026-02-03T08:00:00Z"`

**Money Formats:**
- All monetary amounts use **integer minor units**:
  - Example: `subtotal_cents`, `discount_cents`, `total_cents`
- Never send floating-point currency values.

### Communication Patterns

**Client ↔ Server Contract (Supabase-native):**
- Client never holds Supabase service-role credentials.
- **Server Actions** call Supabase directly with service-role key (server-side only).
- Browser client uses Supabase anon key for unauthenticated reads or user's JWT for authenticated operations.
- **RLS policies** enforce data access control at the database level.

**Auth Session Handling:**
- JWT stored in memory (no localStorage for MVP).
- Next.js middleware validates JWT from cookies on each request.
*Removed for MVP*: No Support role; Admin/Management handle tickets without ticket-scoped restrictions.

### Process Patterns

**Validation Timing:**
- Client: validate with Zod (React Hook Form + Zod resolver) for UX feedback.
- Server Actions: re-validate with same Zod schemas (authoritative).
- Supabase RLS: final security boundary at database level.

**Loading State Handling:**
- Use Next.js Suspense boundaries for Server Components.
- Skeleton states for product grids and detail pages (per UX spec).
- Client Components show local loading indicators (buttons, spinners).

**Error Handling:**
- Server Actions throw Error objects with `code` property for categorization.
- Client catches errors, displays user-friendly messages (no raw stack traces).
- Server logs detailed errors (Supabase logs + console structured logs).

**Retry Strategy (MVP):**
- No automatic retries for external calls (payments, shipment API).
- Expose manual retry paths in admin/management ticket and operations flows where relevant.

**Rate Limiting (MVP):**
- Implement basic rate limiting via Next.js middleware for public routes.
- Example: guest order lookup, auth endpoints.

### Enforcement Guidelines

**All AI Agents MUST:**
- Use snake_case for all API JSON payloads, and singular snake_case for DB tables/columns.
- Use the canonical endpoints for payments and orders:
  - `/api/payments/{provider}/verify` and `/api/orders/create`
- Use ISO 8601 UTC timestamps and `*_cents` money fields.
- Use RFC7807 Problem+JSON for all errors (minimal required fields).

**Pattern Enforcement:**
- PR reviews/agent reviews: reject changes that introduce camelCase JSON, new endpoint naming schemes, or alternate money/time formats.
- Any new pattern must be documented here before adoption.

### Pattern Examples

**Good Examples:**
- `POST /api/payments/stripe/verify` returns `{ verified: true, payment_id: "...", provider: "stripe" }`
- `POST /api/orders/create` returns `{ order_id: "<uuid>", created_at: "<iso_z>", total_cents: 12345 }`
- Error: `409` with `{ "type": "...", "title": "Stock conflict", "status": 409, "code": "out_of_stock" }`

**Anti-Patterns:**
- Returning `total: 12.34` (floats) or mixing cents + decimals.
- Introducing `/api/createOrder` or `/api/payment/verifyStripe` (verb-first inconsistency).
- Returning camelCase JSON fields (`orderId`) when the API standard is snake_case.

## Project Structure & Boundaries

### Complete Project Directory Structure (src/ layout)

```
freemarket/
├── README.md
├── package.json
├── bun.lockb or pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json            # shadcn/ui config (if used)
├── .gitignore
├── .env.local
├── .env.example
├── src/
│   ├── middleware.ts          # Next.js middleware (auth, route guards)
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Tailwind CSS imports
│   │   ├── (storefront)/
│   │   │   ├── layout.tsx     # Storefront layout
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── cart/
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts    # verifyStripePayment, verifyPayPalPayment, createOrder
│   │   │   ├── orders/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── lookup/
│   │   │   │       └── page.tsx  # Guest order tracking
│   │   │   └── account/
│   │   │       ├── page.tsx
│   │   │       └── orders/
│   │   │           └── page.tsx
│   │   ├── (backoffice)/
│   │   │   ├── layout.tsx        # Backoffice layout (role-gated)
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── actions.ts
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── shipments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── actions.ts
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── discounts/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts
│   │   └── api/
│   │       └── webhooks/          # Optional: external webhooks only
│   │           ├── stripe/
│   │           │   └── route.ts
│   │           └── paypal/
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/                    # shared shadcn/ui primitives only
│   │   └── layout/                # shared layout shells (Header/Footer/etc.)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser Supabase client (anon key)
│   │   │   └── server.ts        # Server Supabase client (service role)
│   │   ├── schemas/
│   │   ├── actions/             # Shared Server Actions (optional centralization)
│   │   ├── services/            # Stripe/PayPal/Shipment/Email clients
│   │   ├── hooks/
│   │   └── utils.ts
│   └── types/
│       ├── database.types.ts    # Supabase generated types
│       ├── order.ts
│       ├── product.ts
│       └── shipment.ts
└── public/
  ├── images/
  └── icons/
```

### Directory Responsibilities

#### `src/app/` (Next.js App Router)

The `src/app/` directory contains all routes, layouts, and page components using Next.js file-based routing.

**Route groups:**
- `(storefront)/`: Customer-facing pages (product catalog, cart, checkout, orders, account).
- `(backoffice)/`: Admin/management pages (protected by middleware). No Support module in MVP.

**Server Actions:**
- Colocated with features as `actions.ts` files (e.g., `src/app/(storefront)/checkout/actions.ts`).
- Or centralized in `src/lib/actions/` if shared across multiple features.

**Pages:**
- Each `page.tsx` is a route-level component (Server Component by default).
- Use `'use client'` for interactive components (forms, cart state, real-time updates).

**Layouts:**
- `layout.tsx` files define shared UI for route segments.
- Root `layout.tsx` wraps entire app; route group layouts add feature-specific shells.

#### `components/`

Shared-only React components:
- `ui/`: shadcn/ui primitives (Button, Card, Form, Dialog, etc.) used across multiple routes.
- `layout/`: shared layout shells (Header, Footer, Sidebar).

Feature/route-specific components must be colocated within their route under `src/app/...` per the Route Colocation Policy.

#### `lib/`

Shared application logic and integrations:

**`src/lib/supabase/`:**
- `client.ts`: Browser Supabase client (uses anon key; user JWT added automatically).
- `server.ts`: Server Supabase client (uses service role key; server-side only).
- `middleware.ts`: Middleware helper for Supabase auth validation.

**`src/lib/schemas/`:**
- Zod schemas for validation (used by both client forms and Server Actions).
- Examples: `orderSchema.ts`, `paymentSchema.ts`, `productSchema.ts`, `shipmentSchema.ts`.
- Server Actions re-validate all input with these schemas (authoritative).

**`src/lib/actions/`:**
- Centralized Server Actions if not colocated with features.
- Examples: `orders.ts`, `payments.ts`, `shipments.ts`.
- Each file exports multiple Server Action functions.

**`src/lib/services/`:**
- External API integrations: Stripe, PayPal, shipment API, email provider.
- Server-side only; never expose secrets to client.

**`src/lib/hooks/`:**
- React hooks for client-side state (`useCart`, `useAuth`, etc.).

#### `src/middleware.ts`

Next.js middleware runs on every request:
- Validates JWT from Supabase Auth.
- Enforces role-based route protection (redirects unauthorized users).
- Sets request context for logging/tracing.

#### `types/`

TypeScript type definitions:
- `database.types.ts`: Supabase generated types (from `supabase gen types typescript`).
- Domain types: `order.ts`, `product.ts`, `shipment.ts`.

### Architectural Boundaries

**Server Action Boundaries:**
- Payments: `verifyStripePayment()`, `verifyPayPalPayment()` in `app/(storefront)/checkout/actions.ts`.
- Orders: `createOrder(verificationId)` in `app/(storefront)/checkout/actions.ts`.
- Products: CRUD actions in `app/(backoffice)/products/actions.ts`.
- Inventory: `adjustInventory()` in `app/(backoffice)/inventory/actions.ts`.
- Shipments: `updateShipmentStatus()`, `createShipment()` in `app/(backoffice)/shipments/actions.ts`.
- Support: Deferred in MVP. If implemented, ticket actions can be colocated under back-office.

**Supabase RLS Policy Boundaries:**
- Users can only read/write their own orders (RLS policy on `order` table).
- No Support role in MVP; tickets are accessible to Admin/Management (no ticket-scope checks).
- Admin/Management roles have broader access (RLS policies check role claim in JWT).
- Products/inventory are read-only for customers, read-write for admin/management.

**Component Boundaries:**
- `app/(storefront)/`: Customer UI flows (catalog → checkout → tracking).
- `app/(backoffice)/`: Admin/ops UI (CRUD, dashboards, shipment management).
- `components/`: Reusable UI components (domain-specific and generic).

**Data Boundaries:**
- Supabase Postgres is the system of record.
- Server Actions call Supabase directly with service role credentials (server-side only).
- Browser client uses anon key + user JWT (RLS policies enforce access control).
- Supabase Auth handles authentication; RLS policies handle authorization.

### Requirements to Structure Mapping

- Catalog & Product Discovery (FR1–FR6) → `app/(storefront)/products/`, `components/product/`, Supabase queries in Server Components
- Cart & Checkout (FR7–FR13) → `app/(storefront)/cart/`, `app/(storefront)/checkout/`, `components/cart/`, `components/checkout/`
- Authentication & Accounts (FR14–FR17) → `lib/supabase/`, Supabase Auth, `app/(storefront)/account/`
- Payments (FR18–FR23) → `app/(storefront)/checkout/actions.ts`, `lib/services/stripeService.ts`, `lib/services/paypalService.ts`
- Orders + Guest Tracking (FR24–FR28) → `app/(storefront)/orders/`, guest lookup page, Server Actions for order creation
- Shipments & Fulfillment (FR29–FR35) → `app/(backoffice)/shipments/`, `lib/services/shipmentService.ts`, Server Actions
- Discounts & Loyalty (FR36–FR40) → `app/(backoffice)/discounts/`, pricing logic in order creation Server Action
- Back-office ops (FR41–FR46) → `app/(backoffice)/*`, RLS policies enforce role-based access
- Support (FR47–FR50) → Deferred/relaxed for MVP: No Support role; ticket capture (if implemented) is visible to Admin/Management without ticket-scoped restriction.

### Integration Points

**Internal Communication:**
- Server Components/Server Actions → Supabase (direct queries via `lib/supabase/server.ts`).
- Client Components → Server Actions (via Next.js RPC mechanism).
- Client → Supabase Auth (for sign-in/sign-out only; uses `lib/supabase/client.ts`).

**External Integrations:**
- Stripe: Server Actions call Stripe API via `lib/services/stripeService.ts`.
- PayPal: Server Actions call PayPal API via `lib/services/paypalService.ts`.
- Shipment API: Server Actions call external API via `lib/services/shipmentService.ts`.
- Email: Server Actions send emails via `lib/services/emailService.ts` (provider TBD).

**Data Flow (Payments - Two-Step via Server Actions):**
1. Client collects payment intent/approval in provider UI (Stripe or PayPal).
2. Client calls Server Action `verifyStripePayment()` or `verifyPayPalPayment()`.
3. Server Action validates payment with provider API, creates verification record in Supabase (TTL: 10 min, single-use).
4. Server Action returns verification ID to client.
5. Client calls Server Action `createOrder(verificationId)`.
6. Server Action validates verification record, marks as used, creates order in Supabase (RLS policies enforce user can only create own order).
7. Server Action returns `order_id` and confirmation data.

### File Organization Patterns

- React components: **PascalCase** (e.g., `ProductCard.tsx`, `CheckoutForm.tsx`).
- Utilities/hooks/services: **camelCase** (e.g., `useCart.ts`, `stripeService.ts`).
- Server Action files: **actions.ts** (colocated with features or in `lib/actions/`).
- Zod schema files: **camelCase** with `Schema` suffix (e.g., `orderSchema.ts`, `paymentSchema.ts`).

### Development Workflow Integration

- `bun run dev` or your chosen package manager starts the Next.js development server with HMR.
- Next.js automatically handles file-based routing, Server Component rendering, and Server Action compilation.

- `bun run build` (or equivalent) creates a production-optimized build in `.next/`.
- Next.js bundles Server Components separately from Client Components for optimal performance.

**Deployment:**
- Deploy to Vercel (zero-config), Netlify, Railway, or self-hosted Node.js server.
- Environment variables configured via hosting platform or `.env.production`.
- Supabase connection and secrets managed server-side only.

## Architecture Validation & Completion

### Coherence Validation ✅

**Decision Compatibility:**
- Next.js + Supabase-native architecture is coherent (Server Actions call Supabase directly; RLS policies enforce access control).
- Supabase Auth + RLS + triggers eliminate need for manual server-side auth validation and audit logging code.
- Stripe + PayPal verification via Server Actions aligns with the two-step payment flow.
- Data formats are consistent: snake_case DB columns, camelCase TypeScript, ISO 8601 UTC timestamps, `*_cents` money fields.
- Supabase migrations or Drizzle ORM provides consistent schema management.

**Pattern Consistency:**
- Naming conventions are consistent: snake_case DB columns, camelCase TypeScript, Server Actions named verb+noun.
- Next.js patterns (Server Components, Server Actions, middleware) provide architectural consistency.
- Supabase RLS policies provide consistent authorization layer.

**Structure Alignment:**
- Next.js app directory structure supports feature-based organization with route groups.
- Server Actions colocated with features or centralized in `lib/actions/` provide clear boundaries.
- Supabase-native approach eliminates intermediate API layer complexity.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- Catalog + Product detail + provenance + variants: covered by Server Components in `app/(storefront)/products/` + Supabase queries.
- Cart + Checkout + payments: covered by Client Components + Server Actions in `app/(storefront)/cart/` and `app/(storefront)/checkout/`.
- Orders + guest tracking: covered by Server Components + Server Actions in `app/(storefront)/orders/`.
- Shipments lifecycle + admin management: covered by Server Actions in `app/(backoffice)/shipments/` + external API integration.
- Discounts/loyalty: mapped to `src/app/(backoffice)/discounts/` with RLS policies. Support tickets are deferred in MVP; Admin/Management may access ticket data if implemented.

**Non-Functional Requirements Coverage:**
- Performance: addressed via hybrid rendering (SSR), Suspense boundaries, skeleton loading patterns.
- Reliability: addressed via two-step payment verification, RLS policies, database triggers for audit logging.
- Security/access control: Supabase Auth + RLS policies + Next.js middleware enforce authorization at multiple layers.

### Implementation Readiness Validation ✅

**Decision Completeness:**
- Core stack decisions are complete.

Each feature directory should contain:
- **Pages** (route-level components): `*Page.tsx`
- **Feature components** used only by that feature (cards, panels, drawers)
- **Feature hooks** (optional): `use*` hooks that are scoped to that feature
- **Feature types** (optional): feature-local types (prefer shared Zod schemas for API payloads)
- **Feature API adapters** (optional): thin calls into `src/client/api/ApiClient.ts` (don’t duplicate fetch logic)

Each feature directory should NOT contain:
- Shared UI primitives (put those in `src/client/components/Ui/`)
- Cross-feature business rules (put shared logic in `src/client/api/` or shared utilities)
- Server communication conventions (those belong in `src/client/api/ApiClient.ts`)

This keeps AI agents from scattering “orders logic” across random folders and ensures features stay cohesive.

#### `src/client/features/Storefront/` (Customer-facing UX)

`Storefront/` contains everything the customer touches: discovery, product detail, cart, checkout, confirmation, guest tracking, and account pages. It should align with the UX spec (“What’s fresh this week”, provenance-first product detail, calm checkout).

**General rules inside `Storefront/`:**
- Route-level pages live at the feature root as `*Page.tsx` (or inside subfolders as listed below).
- Feature components are colocated with the feature that owns them.
- UI components should follow the “Garden Editorial” direction and the UX patterns (provenance panel, skeleton loading, calm error states).

##### `Storefront/Catalog/`

Owns catalog browsing and discovery (FR1–FR3).

Should contain:
- `CatalogPage.tsx` (route page)
- `FiltersBar.tsx` (Category + Delivery Window filters, light scope only)
- `ProductCard.tsx` (weekly grid card, shows provenance cues when available)
- (Optional) `CatalogSkeleton.tsx` for loading states

Should NOT contain:
- Product detail rendering (belongs in `ProductDetail/`)
- Cart logic (belongs in `Cart/`)
- Fetch wrapper logic (use `src/client/api/ApiClient.ts`)

##### `Storefront/ProductDetail/`

Owns product detail (FR4–FR6) with provenance-first emphasis.

Should contain:
- `ProductDetailPage.tsx` (route page)
- `ProvenancePanel.tsx` (“From the farm”: farm/origin, harvest/batch, delivery window, farmer profile link/snippet)
- Variant selector + quantity UI components (feature-local)

##### `Storefront/Cart/`

Owns cart UI and cart editing (FR7–FR9).

Should contain:
- `CartDrawer.tsx` (sheet/drawer experience)
- `CartPage.tsx` (full cart view)
- Quantity controls and remove-item components

Rules:
- Always show totals using `*_cents` formatting rules.

##### `Storefront/Checkout/`

Owns checkout + payment UI (FR10–FR23).

Should contain:
- `CheckoutPage.tsx` (route page, React Hook Form + Zod resolver)
- `StripeCheckout.tsx` (Stripe UI integration)
- `PayPalCheckout.tsx` (PayPal SDK integration)
- “processing / success / failure / retry” UI states (feature-local)

Rules:
- Checkout follows the two-step flow:
  1) Call `/api/payments/{provider}/verify`
  2) Call `/api/orders/create`
- No order is created until step (2) succeeds.
- Do not bundle/self-host provider SDKs; load from provider domains.

##### `Storefront/Orders/`

Owns confirmation + tracking UX (FR24–FR28, FR32).

Should contain:
- `OrderConfirmationPage.tsx` (show `order_id`, next steps)
- `GuestOrderLookupPage.tsx` (guest search by `order_id`, calls `/api/orders/lookup`)
- `OrderTrackingPage.tsx` (tracking timeline + exception messaging)

Rules:
- Tracking timeline states must match shipment statuses and explain exceptions (failed/returned) with next actions.

##### `Storefront/Account/`

Owns signed-in customer pages (FR14–FR17).

Should contain:
- `SignInPage.tsx` (Supabase Auth UI)
- `OrderHistoryPage.tsx` (account order list)

Rules:
- Session is memory-only in MVP; do not persist to localStorage.

#### `src/client/features/Backoffice/` (Ops/Admin UX)

Backoffice contains management/admin UIs (CRUD, shipments, tickets) and must be route-group gated by roles/groups.

### Directory Responsibilities (Server)

#### `src/server/api/`

Thin HTTP route handlers only (parse request → validate via Zod → call service → map response/error).

#### `src/server/services/`

All business rules live here (payment verification, order creation, shipment API calls). This is the canonical source of truth for server behavior.

#### `src/schemas/`

Shared Zod schemas used by client and server. Server re-validates all input using these schemas.

### Architectural Boundaries

**API Boundaries (Next.js Route Handlers, REST-ish when needed):**
- Payments:
  - `POST /api/payments/stripe/verify`
  - `POST /api/payments/paypal/verify`
- Orders:
  - `POST /api/orders/create`
  - `GET /api/orders/lookup?order_id=<uuid>` (guest)
  - `GET /api/orders/:id` (authenticated)
- Catalog:
  - `GET /api/products`
  - `GET /api/products/:id`
  - `GET /api/categories`
  - `GET /api/variants` (optional) or nested under products
- Inventory (back-office):
  - `GET /api/inventory`
  - `POST /api/inventory/:id/adjust`
- Shipments:
  - `GET /api/shipments`
  - `GET /api/shipments/:id`
  - `POST /api/shipments/:id/status` (requires reason + resolution notes for failed/returned)
  
  (Support endpoints deferred in MVP; Admin/Management can access tickets through back-office if implemented.)

**Component Boundaries (client):**
- `src/client/features/Storefront/*` contains customer UI flows (catalog → checkout → tracking).
- `src/client/features/Backoffice/*` contains admin/ops UI (CRUD, ops dashboards).
- `src/client/components/Guards/*` is the single canonical source of route gating on the client.

**Service Boundaries (server):**
- `/src/server/services/Payments/*` is the canonical payment verification logic.
- `/src/server/services/Orders/*` owns order creation rules (must require prior verification).
- `/src/server/services/Shipments/*` owns external shipment API integration.

**Data Boundaries:**
- Supabase Postgres is the system of record.
- Server-first: Next.js Server Actions own privileged reads/writes; client does not use service-role access.
- Supabase Auth is used in the browser for sign-in/sign-out only; session storage is memory-only for MVP.

### Requirements to Structure Mapping

- Catalog & Product Discovery (FR1–FR6) → `src/client/features/Storefront/Catalog`, `src/client/features/Storefront/ProductDetail`, `src/server/api/ProductRoutes.ts`
- Cart & Checkout (FR7–FR13) → `src/client/features/Storefront/Cart`, `src/client/features/Storefront/Checkout`
- Authentication & Accounts (FR14–FR17) → `src/client/auth`, `src/client/features/Storefront/Account`, `src/server/auth/*`
- Payments (FR18–FR23) → `src/client/features/Storefront/Checkout/*`, `src/server/api/PaymentRoutes.ts`, `src/server/services/Payments/*`
- Orders + Guest Tracking (FR24–FR28) → `src/client/features/Storefront/Orders`, `src/server/api/OrderRoutes.ts`, `src/server/services/Orders/*`
- Shipments & Fulfillment (FR29–FR35) → `src/server/services/Shipments/*`, `src/client/features/Backoffice/Shipments`, `src/client/features/Storefront/Orders/OrderTrackingPage.tsx`
- Discounts & Loyalty (FR36–FR40) → `src/client/features/Backoffice/Discounts`, `src/server/api/OrderRoutes.ts` (pricing), `src/schemas/OrderSchemas.ts`
- Back-office ops (FR41–FR46) → `src/client/features/Backoffice/*`, `src/server/auth/*` (RBAC)
- Support (FR47–FR50) → Deferred/relaxed for MVP. No Support role; if tickets are implemented, Admin/Management access them without ticket-scoped restriction.

### Integration Points

**Internal Communication:**
- Client → Server: Server Actions (preferred) or fetch to `/api/...` for route handlers, returning snake_case JSON.
- Server → Supabase: `src/lib/supabase/server.ts` (service role) for privileged DB operations.
- Client → Supabase Auth: browser client for sign-in/sign-out only (`src/lib/supabase/client.ts`).

**External Integrations:**
- Stripe: client SDK + server verification service (`StripeVerifyService.ts`).
- PayPal: client SDK + server verification service (`PayPalVerifyService.ts`).
- Shipment API: server-only integration (`ShipmentApiService.ts`).
- Email: server-only sending (`EmailService.ts`, provider TBD).

**Data Flow (Payments):**
1) Client collects payment intent/approval in provider UI.
2) Client calls `POST /api/payments/{provider}/verify`.
3) If verified, client calls `POST /api/orders/create` with the verification reference (no order is created before this).
4) Server writes order to Supabase and returns `order_id` + confirmation payload.

### File Organization Patterns (applied)

- New TS/TSX files: PascalCase.
- Shared Zod schemas live in `src/schemas/*`.
- API handlers live in `src/server/api/*`, services in `src/server/services/*`.

### Development Workflow Integration

**Development server:**
- `bun run dev` starts the Next.js development server with HMR.

**Build process:**
- `bun run build` creates a production-optimized build in `.next/`.

**Deployment:**
- Deploy the Next.js app to Vercel/Netlify/Railway or a Node.js host; Next.js serves static assets and Route Handlers, Server Actions run server-side.

## Architecture Validation & Completion

### Coherence Validation ✅

- Next.js App Router + Supabase-native architecture is coherent (hybrid SSR + Server Actions, no separate API server needed).
- Supabase (Postgres + Auth) aligns with server-first access model and shared Zod schemas.
- Stripe + PayPal with server-side verification aligns with the two-step API boundary.
- API formats are consistent: snake_case JSON + RFC7807 Problem+JSON + ISO 8601 UTC + `*_cents`.
- ORM choice is finalized (Drizzle), preventing migration tooling divergence.

**Pattern Consistency:**
- Naming conventions are consistent across DB/API/code: singular snake_case DB tables, snake_case JSON payloads, PascalCase new TS/TSX files.
- Error handling and rate limiting patterns match the server-first design.

**Structure Alignment:**
- The project tree supports the decisions: server routes/services are centralized; feature boundaries are clear for the client.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- Catalog + Product detail + provenance + variants: covered by Storefront/Catalog + Storefront/ProductDetail + ProductRoutes.
- Cart + Checkout + payments: covered by Storefront/Cart + Storefront/Checkout + PaymentRoutes + verify services.
- Orders + guest tracking: covered by Storefront/Orders + OrderRoutes + `/api/orders/lookup`.
- Shipments lifecycle + admin management: covered by ShipmentRoutes + Backoffice/Shipments + ShipmentApiService.
- Discounts/loyalty: mapped to Backoffice/Discounts. Support tickets are deferred in MVP; Admin/Management handle any ticket intake.

**Non-Functional Requirements Coverage:**
- Performance: addressed via CSR + skeleton loading + local loading patterns.
- Reliability: addressed via verify-before-create rule, explicit error formats, rate limiting, and server-first control.
- Security/access control: Supabase Auth + server RBAC/ticket scope enforced at server boundary.
- Compliance/audit logging: explicitly deferred for test MVP (see deferred items).

### Implementation Readiness Validation ✅

**Decision Completeness:**
- Core stack decisions are complete.
- ORM is selected (Drizzle).
- Two-step payments have a canonical, idempotent handoff contract (verification record required to create order).
- Auth token propagation is canonicalized (`Authorization: Bearer <supabase_jwt>`).

**Structure Completeness:**
- Project structure and boundaries are complete enough for parallel work across agents.

**Pattern Completeness:**
- Naming/format/process patterns are clear and enforceable (snake_case JSON, `*_cents`, ISO UTC, RFC7807 errors, canonical endpoints).

### Gap Analysis Results

**Addressed (resolved in validation):**
- ORM selection finalized: **Drizzle**.
- Two-step payment handoff contract defined:
  - Verification is persisted server-side.
  - `POST /api/orders/create` requires a short-lived verification record (TTL **10 minutes**).
  - Verification records are **single-use** to enforce idempotency and prevent duplicate order creation.
- Auth token propagation defined:
  - Authenticated client→server requests use `Authorization: Bearer <supabase_jwt>`.

**Deferred (acceptable for test MVP):**
- Audit logging requirement (PRD) deferred: no “who accessed what” auditing for test MVP.
- Email provider not selected (provider TBD; can stub).
- Consider Edge Functions/webhooks post-MVP if payment webhook handling or scaling requires it.

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High (for test MVP)

**Key Strengths:**
- Strong consistency rules (snake_case JSON, `*_cents`, RFC7807 errors).
- Clear server-first boundaries and feature mapping.
- Payment verification enforced server-side with explicit idempotency and single-use semantics.

**Areas for Future Enhancement:**
- Add webhooks/Edge Functions if moving beyond test MVP.
- Add audit logging for production readiness.
- Select an email provider and define email delivery guarantees.