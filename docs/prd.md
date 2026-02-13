# Product Requirements Document - Freemarket

**Author:** andyalv
**Date:** 2026-02-03

## Executive Summary

Freemarket is a Next.js application with hybrid server-side rendering (SSR) and client-side interactivity that combines a customer storefront and an internal back-office (role/group gated routes) to sell FreeMarket products. The backend is Supabase-native, leveraging Postgres with RLS, built-in Auth, and database triggers for core functionality.

The MVP is experience-led: users should shop quickly, understand what they're buying (variants + transparency fields like batch/harvest when available), successfully pay (Stripe cards or PayPal), and then confidently track fulfillment. Orders are created only after payment is verified server-side via Server Actions; shipments are created after orders during fulfillment via an external shipment API and persisted in Supabase.

## Success Criteria

### User Success

- Users can browse the catalog with filtering/sorting and view product details (price, batch/harvest, variants, etc.)
- Users can add products to cart and complete checkout in **≤ 12 minutes**
- Checkout supports:
  - Guest checkout (no account required) but **email is required** for order/shipment follow-up
  - Optional sign-in
  - Payment methods: **Credit/Debit via Stripe**, **PayPal**
- Users receive email confirmation with order + shipment details
- Users can confirm order and track shipment status via:
  - Order ID lookup (guest tracking)
  - A dedicated account page for order tracking
- Target user feeling: “I was able to shop fast, understood what I was buying and know when it will arrive”

### Business Success

By end of Month 1:
- Traffic conversion → first order: **≥ 35%**
- Active clients: **~50–80**
- Early retention (≥ 2 orders): **≥ 25–30%**
- Orders with ≥ 2 orders: **~25–30%**
- TTFV: **≤ 12 min**

By end of Month 3:
- Orders: **~140–160 orders/month** (~20 orders/day average)
- Active clients: **~180–250**
- Retention: **45–55%**
- RPR: **50%**

Business definition of success: a functional and stable channel for selling FreeMarket products.

### Technical Success

- Performance: homepage, shop, product CRUD, cart, checkout load in **< 2–3 seconds** on a normal connection
- Order creation reliability:
  - No silent data loss; cannot lose an order’s data
  - Failure rate **< 1%**
  - Recovery path available when failures occur (no “lost orders”)
- Data integrity:
  - Persistent stock stays consistent with orders
  - Shipment status transitions work reliably
- Payments (MVP scope):
  - Stripe **test mode** for development testing
  - PayPal **sandbox** for development testing
  - Persist provider IDs/status/timestamps; do not store raw card data

### Measurable Outcomes

- Checkout happy-path completion time: **≤ 12 minutes**
- First-order conversion: **≥ 35%** by end of month 1
- Order creation failure rate: **< 1%**
- Primary screens load time: **< 2–3 seconds**
- Shipment API integration reliably creates shipment records on OK response
- Ops failure resolution: **≤ 24 hours**

## Product Scope

### MVP - Minimum Viable Product

- Storefront:
  - Catalog browse with filter/sort
  - Product details (including batch/harvest data when available) + variants
  - Cart
- Checkout:
  - Guest checkout (email required) and optional sign-in
  - Payment methods: Stripe (cards) + PayPal
  - Clear order confirmation and follow-up email
- Order tracking:
  - Tracking page by order ID (shipment details appear once created)
  - Order tracking within a user account
- Admin/Management (single app, role/group gated routes):
  - Products/categories/variants CRUD
  - Inventory stock updates
  - Orders view + operational workflows
  - Shipments view + manual status updates (created/shipped/delivered/failed/returned) with reasons and resolution actions
- Integrations:
  - Supabase for persistence
  - External shipment API
  - Stripe + PayPal with dev test/sandbox support

### Growth Features (Post-MVP)

- Saved payment methods / one-click checkout
- Apple Pay / Google Pay
- Automated shipment status updates (webhooks/polling)
- Advanced analytics/reporting dashboards beyond basic operational views

### Vision (Future)

- Stronger fraud prevention + chargeback handling; expanded payment options
- Expand management into full operations suite (carrier selection, labels, delivery SLAs)
- Deep analytics/reporting (dashboards, cohorts, best sellers, customer preferences)
- Geographic expansion beyond Texas once ops + supply chain are stable

## User Journeys

### Journey 1 — Guest Shopper (Happy Path: Stripe Card)

**Opening Scene:** Sofia is busy and wants to shop quickly, but still needs confidence: “What am I buying, and when will it arrive?”

**Rising Action:** She opens the shop, filters/sorts, and checks product details (price, variants, batch/harvest metadata). She builds a cart and proceeds to checkout.

**Climax:** Checkout prompts her to sign in or continue as guest. She chooses guest checkout, enters her email (required for follow-up), adds shipping details, and selects **Card (Stripe)**. She completes payment successfully. Only after payment succeeds, the system creates the order and shows a confirmation page with order identifier + how to track shipment status.

**Resolution:** Sofia receives an email with order and shipment details. Later, she checks the tracking page (by order ID, or within an account if she signs in) and sees shipment status updates once a shipment exists. She feels: “I shopped fast, understood what I was buying, and know when it will arrive.”

**Key failure points + recovery:**

- Card declined / Stripe error → clear message, allow retry, allow switching to PayPal; **no order is created** until payment succeeds.
- Email send fails → on-screen confirmation still shows order/tracking; Support/Admin can resend email later.

### Journey 2 — Guest Shopper (Happy Path: PayPal + “Canceled”/Failed Handling)

**Opening Scene:** Daniel prefers PayPal for speed and familiarity.

**Rising Action:** He browses, validates product details (especially harvest/batch transparency), builds a cart, and enters checkout.

**Climax:** He enters email and shipping details, selects **PayPal**, and is redirected to PayPal to approve payment. After approval, he returns to the site and sees order confirmation. The system creates the order only after PayPal reports payment success.

**Resolution:** He receives email confirmation and can track shipment status via the tracking page or his account.

**Key failure points + recovery:**

- **User cancels PayPal** (they back out/close the PayPal flow or hit cancel) → return to checkout with “Payment not completed”; allow retry or switch to Stripe; **no order is created**.
- PayPal technical error / timeout → show “Payment failed, please retry”; allow retry/switch; **no order is created** until confirmed paid.

### Journey 3 — Management (Catalog + Inventory + Fulfillment, No User Admin Powers)

**Opening Scene:** Maria (Management) prepares the catalog for the week and needs to keep operations moving. She must be able to fulfill orders, but must not have user administration powers.

**Rising Action:** She signs into the back office and maintains products/categories/variants, updates stock, and ensures transparency fields (harvest/batch) are accurate. Orders start coming in.

**Climax:** Maria reviews orders and shipment queues, and can see the **basic customer contact + shipping info necessary to fulfill** (name, address, email, phone). She creates/updates shipments and handles operational statuses. However, she cannot create/disable/delete users, change roles, or perform privileged user-account operations.

**Resolution:** Orders continue to ship reliably. When something goes wrong, she can perform operational steps and, when needed, hand off account/permission-sensitive actions to Admin.

**Key failure points + recovery:**

- Bad stock data / oversell risk → highlight low-stock warnings and prevent shipping a line item without an explicit resolution path.
- Shipment creation fails / API returns error → surface error, allow retry, and route to Support/Admin if customer communication is needed.

### Journey 4 — Admin/Management Ticket Handling + Escalation

**Opening Scene:** A customer says, “I paid but didn’t get confirmation,” or “Where is my order?” A support ticket is created (by the customer or internally).

**Rising Action:** An Admin or Management user signs in and works the ticket queue. In MVP, tickets are handled by Admin/Management without a separate Support role or ticket-scoped restrictions.

**Climax:** Admin/Management investigates the specific ticket:

- Confirms payment state (Stripe/PayPal IDs and status) tied to that checkout.
- Confirms order existence (only created after successful payment) and shipment creation/status.
- Resends order/shipment emails, updates shipment status if needed, and communicates resolution within **≤ 24 hours**.

If the case requires privileged actions (role changes, user account remediation, broad user lookup, policy exceptions), Support escalates to Admin.

**Resolution:** Customer sees accurate tracking and receives confirmation updates. Issues feel handled quickly and transparently.

**Key failure points + recovery:**

- Payment shows success but no order exists (edge case) → admin-assisted reconciliation workflow; explicit audit trail; no silent loss.
- Shipment failed/returned → Admin/Management coordinates resolution and updates status + messaging within SLA.

### Journey Requirements Summary

- **Role/Access boundaries**
  - `management`: operational access, including shipping contact info and ticket handling; **no user CUD/role admin**
  - `admin`: full access + escalation/grants + user administration, including ticket handling
- **Payment gating**
  - Orders are created **only after** Stripe/PayPal payment success; canceled/failed payments create **no orders**
- **Tracking**
  - Guest tracking by order identifier + optional account-based tracking (shipment status appears once shipment exists)
- **Auditability**
  - Log PII access, ticket access, and privileged admin actions

## Web App Specific Requirements

### Project-Type Overview

- Single web application using Next.js App Router with hybrid rendering (Server Components by default, Client Components where interactivity is needed).
- Storefront + back-office live in the same Next.js app, separated by route groups and role/group-based guards enforced via Supabase RLS policies and server-side validation.

### Technical Architecture Considerations

- Hybrid rendering: Server Components generate initial HTML for better SEO and performance; Client Components handle interactive UI (cart, checkout, forms).
- Supabase is the backend system of record: authentication, row-level security (RLS) policies, database triggers for audit logging, and storage.
- Server Actions in Next.js handle mutations (CRUD, payments, shipment creation) with direct Supabase client calls.
- Role/group-based authorization enforced via Supabase RLS policies at the database level; route-level guards in Next.js middleware provide UX/security layering.
- Manual refresh is acceptable for operational views (no real-time requirement for MVP).

### Browser Matrix

- Required: latest stable **Chrome** and **Microsoft Edge** (Chromium-based).
- Optional / best-effort: latest stable **Firefox**.
- Not required for MVP: **Safari** (desktop/iOS).

### Responsive Design

- Desktop-first layout and workflows are the priority for MVP (admin + storefront).
- Mobile support is best-effort only; no mobile-specific UX optimization required for MVP.

### Performance Targets

- Primary screens (home, shop/catalog, product details, cart, checkout, admin CRUD) load/transition in **< 2–3 seconds** on a normal connection.
- Avoid slow “blank screens”: show skeleton/loading states during data fetch.
- Payment redirect/return flows should clearly show “processing/confirming payment” until definitive success/failure.

### SEO Strategy

- SEO is not a priority for MVP.
- Ensure clean URL structure and basic metadata where easy (page titles), but no SSR/SSG requirement.

### Accessibility Level

- Best-effort baseline for MVP:
  - Keyboard navigation for core flows where feasible
  - Visible focus states
  - Semantic HTML in key forms (checkout/admin CRUD)
- No formal WCAG target required for MVP.

### Implementation Considerations

- Route groups:
  - Public storefront routes
  - Authenticated user account routes (optional for MVP tracking)
  - Back-office routes gated by roles/groups
- Payment flows:
  - Stripe (card) and PayPal integrations with dev testing/sandbox support.
  - Order is persisted only after payment success (per your rules).
- Support visibility:
  - Admin/Management handle tickets in MVP (no separate Support role and no ticket-scoped restriction).

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP (trust + clarity + speed)

- The MVP wins if users can shop quickly, understand product provenance (batch/harvest/variants), complete payment, and confidently track fulfillment.

**Resource Requirements:** 1–2 full-stack developers

- Frontend: React + React Router, Tailwind/shadcn UI
- Backend/API: Supabase (DB + auth), basic API endpoints/server-side verification
- Integrations: external shipment API; Stripe cards + PayPal (test/sandbox)
- No dedicated designer/DevOps assumed (managed services + existing UI kit)
- Target timeline: **6–8 weeks** for a focused, production-ready MVP

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- Guest shopper checkout via **Stripe cards** and **PayPal**
- Back-office operations: management/admin handling catalog + inventory + orders + shipments + tickets
- Lightweight support intake stored in DB + visible in support dashboard (resolution can happen externally)

**Must-Have Capabilities:**

- Capability contract: **FR1–FR50** defines MVP functionality (storefront, auth, payments, orders, shipments, back-office, support).
- Scope constraints for speed:
  - Desktop-first; no real-time requirements; no SEO/SSR requirement.
  - No delivery-fee or tax calculation in MVP.
  - Payments: client-side success + server-side verification; **no webhooks in MVP**.
  - No order persisted until payment verified successful.
  - Guest tracking by **order ID**; shipment status appears once shipment exists.
  - Tickets: lightweight intake + dashboard; resolution can happen externally.

### Post-MVP Features

**Phase 2 (Post-MVP):**

- Payment webhooks for higher reliability/automation
- Refund/chargeback workflows (more complete)
- Saved payment methods / one-click checkout
- Mobile-first UX improvements
- Automated shipment tracking updates

**Phase 3 (Expansion):**

- Advanced analytics/cohorts and operational dashboards
- Expanded payment options (Apple Pay/Google Pay), stronger fraud controls
- Richer support workflows (in-app communications, SLAs, automation)

### Risk Mitigation Strategy

**Technical Risks:**

- Payments integration + state correctness (highest risk)
  - Mitigation: thin integration; server-side verify; clear “processing/failed” states; no webhooks in MVP
- Data integrity (orders/stock/shipments)
  - Mitigation: strict transactional writes where possible; audit logging; no silent failures

**Market Risks:**

- Users may not trust provenance claims or feel clarity at checkout
  - Mitigation: emphasize transparency fields and tracking UX; measure trust proxy metrics; iterate copy/UX quickly

**Resource Risks:**

- 6–8 week timeline with 1–2 devs + payments
  - Mitigation: keep scope tight (desktop-first, no real-time, lightweight support, no payment webhooks/saved methods)

## Functional Requirements

### Catalog & Product Discovery

- FR1: Guest visitors can browse the product catalog.
- FR2: Guest visitors can filter products by available attributes (e.g., category).
- FR3: Guest visitors can sort product listings.
- FR4: Guest visitors can view a product details page.
- FR5: The system can display product transparency fields (e.g., batch/harvest date) when provided.
- FR6: The system can present product variants and allow selecting a variant for purchase.

### Cart & Checkout

- FR7: Guest visitors can add products/variants to a cart.
- FR8: Users can update cart quantities and remove items.
- FR9: Users can proceed from cart to checkout.
- FR10: During checkout, users can provide an email address required for order follow-up.
- FR11: During checkout, users can provide shipping contact details required for fulfillment.
- FR12: The system can create a checkout attempt without persisting an order until payment is verified successful.
- FR13: The system can present an order summary that ignores taxes and delivery-fee calculation for MVP.

### Authentication & Accounts

- FR14: Users can create/sign in to an account using email authentication.
- FR15: Users can sign in using Google authentication.
- FR16: Signed-in users can view their own order history.
- FR17: Signed-in users can view order details including shipment status for their own orders.

### Payments (Stripe + PayPal)

- FR18: Users can choose Stripe card checkout as a payment method.
- FR19: Users can choose PayPal checkout as a payment method.
- FR20: The system can verify payment server-side after client-side payment success.
- FR21: The system only persists an order after payment is verified successful.
- FR22: The system can handle payment failures by allowing a user to retry payment.
- FR23: The system can handle a user canceling PayPal approval by returning them to checkout without creating an order.

### Orders, Confirmations, and Guest Tracking

- FR24: The system can generate an order identifier on successful order creation.
- FR25: The system can display an order confirmation page after successful order creation.
- FR26: The system can send an email containing the order identifier and confirmation details.
- FR27: The system can provide a guest-facing order lookup page where a customer can enter an order ID to view order/shipment status.
- FR28: The system ensures customers can access order tracking via email-provided order ID without requiring account creation.

### Shipments & Fulfillment

- FR29: The system can create a shipment request to an external shipment API for a paid order.
- FR30: On successful shipment API response, the system can persist a shipment record in Supabase associated with an order.
- FR31: The system can persist shipment status, timestamps, and returned shipment metadata (when provided).
- FR32: Customers can view shipment status associated with their order (via account or guest lookup).
- FR33: Admin/Management users can view shipments and shipment details required for operations.
- FR34: Admin/Management users can update shipment status to an allowed set (e.g., created, shipped, delivered, failed, returned).
- FR35: The system can record reasons and resolution notes for failed/returned shipments.

### Discounts & Loyalty

- FR36: The system can apply temporal discounts to an order subtotal.
- FR37: The system can apply loyalty discounts based on configured loyalty rules.
- FR38: The system can enforce discount stacking rules as defined (applies to subtotal only).
- FR39: Users can view the applied discounts on their order.
- FR40: The system can make loyalty status/eligibility visible within an account area.

### Back-Office (Products, Inventory, Orders)

- FR41: Authorized back-office users can create and edit products, categories, and variants.
- FR42: Authorized back-office users can manage inventory stock counts per SKU/variant.
- FR43: Authorized back-office users can configure temporal discounts.
- FR44: Authorized back-office users can view orders and order details needed for fulfillment.
- FR45: Management users can access customer shipping contact info required for fulfillment.
- FR46: Management users cannot perform user create/update/delete operations for user accounts or change user roles.

### Roles, Access Control, and Support

- FR47: The system can enforce role/group-based access to route groups (storefront vs back-office).
- FR48: Admin/Management users can access customer/order data needed to resolve tickets (no ticket-scoped restriction in MVP).
- FR49: Admin users can access broader user and order data as needed for escalation and operations.
- FR50: The system can capture a support ticket submission and store it in the database for display in an admin/management dashboard.

## Non-Functional Requirements

### Performance

- NFR1: Core screens (home, shop/catalog, product detail, cart, checkout, admin CRUD) should load/transition in **≤ 2–3 seconds** on a normal consumer connection.
- NFR2: The system should avoid blank states and provide loading indicators for network-dependent screens.
- NFR3: Payment return/verification states must present clear “processing / success / failure” outcomes.

### Reliability & Data Integrity

- NFR4: Order creation must not silently lose data; any failure must be surfaced and recoverable.
- NFR5: Failed order creation rate should be **< 1%** under normal operation.
- NFR6: Shipment records must remain consistent with orders (no orphan shipments; status transitions must be auditable).
- NFR7: Ops-facing issues (failed/returned shipments) should be resolvable within **≤ 24 hours** (process + tooling support).

### Security & Access Control

- NFR8: All traffic must be encrypted in transit (HTTPS).
- NFR9: Role/group access control must be enforced for back-office route groups and data access.
- NFR10: Management must not have user CUD/role admin capabilities; Admin/Management ticket handling permissions must be enforced and audited.
- NFR11: Sensitive actions (role changes, escalations, shipment status changes, ticket assignment) must be audit-logged.

### Integration

- NFR12: Payment integrations must support **test/sandbox** modes in development environments.
- NFR13: External shipment API failures must be handled explicitly (no silent failure) and support retry/resolution workflows.
