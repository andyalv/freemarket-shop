# Product Brief: freemarket

## Executive Summary

FreeMarket is a Texas-based organic farm business that currently sells through local markets and lacks an online sales channel. This project delivers a B2C e-commerce platform that lets FreeMarket sell directly to eco-focused families in Texas with full control over products, pricing, inventory, customers, and operations—without surrendering revenue margin to third-party marketplaces.

The platform will support a modern online shopping experience (browse, cart, checkout, account), operational tooling (inventory, product management, shipment management), and executive visibility (sales and customer/product insights). Success is defined as a stable, production-ready shop where ~20 orders/day is normal and typical baskets average ~$300.

---

## Core Vision

### Problem Statement

FreeMarket does not currently have an owned online channel to sell and fulfill its organic farm products directly to customers. Relying on offline local markets limits growth, reduces customer convenience, and prevents FreeMarket from building direct customer relationships and repeat purchasing behavior at scale.

### Problem Impact

- Customers who want farm-fresh, chemical-free food delivered have friction (availability, time, travel, inconsistent access).
- FreeMarket misses revenue opportunities (no always-on storefront, limited reach beyond physical venues).
- FreeMarket lacks scalable operational control for direct-to-consumer ordering, inventory visibility, and customer insights.

### Why Existing Solutions Fall Short

Existing third-party platforms/marketplaces are not fit for FreeMarket’s goals because they capture too much revenue and reduce control over the customer experience, business data, and long-term relationship building. FreeMarket needs an owned platform with controllable economics, branding, and data.

### Proposed Solution

Build “FreeMarket” as an owned B2C e-commerce web application using:

- React + React Router (frontend)
- Supabase (DB, API, storage, authentication)
- Tailwind + shadcn/ui (UI styling + components)
- Bun (runtime/build/tooling)

Core capabilities:

- Product catalog and product detail pages (including batch/harvest transparency fields)
- Cart for multi-product purchases
- User accounts with email auth and Google sign-in
- Checkout with **Stripe (cards)** + **PayPal** (supporting Visa/Mastercard + PayPal) with full test/sandbox support in development
- Shipments: create and track shipments with statuses (created, shipped, delivered, failed, returned)
  - Tracking updates are handled externally; the app sends an API request to an external shipment service (URL via env/config var), and upon success persists shipment records in Supabase and shows them in the customer’s tracking page
- Admin/management tooling:
  - Product + inventory management (stock updates reflected in shop)
  - Shipment management (all statuses)
  - User management
  - Reporting dashboards (sales, best sellers, customer preferences, etc.)

Architecture requirement:

- Module-based structure: each route/module contains everything it needs (UI, logic, assets), designed as independent but interoperable modules.

### Key Differentiators

- Farm-to-door transparency as a first-class product feature
- Batch/harvest dates published per product/batch to build trust and quality assurance
- Loyalty system that rewards repeat purchases inside the app
- Owned platform economics and data (no marketplace revenue share), enabling sustainable growth

## Target Users

### Primary Users

#### Persona 1: “The Health-First Parent”

**Profile**

- Urban/suburban Texas parent in a 2–5 person household (couple with young kids or teenagers)
- Age: 30–55
- Household income: ~$80k–$180k
- Dietary priorities: organic/no chemicals, local origin, children’s welfare, minimizing ultra-processed foods
- Often adjacent to: clean eating, paleo, keto, gluten-free (partial)

**Goals**

- Keep the household stocked with trustworthy, high-quality food
- Reduce friction of sourcing organic/local products consistently
- Feel confident in what they feed their kids (traceability + transparency)

**Pain Today**

- Local market shopping is time-bound and inconvenient for repeat replenishment
- Hard to consistently verify freshness, origin, and “no chemicals” claims at scale
- Managing a full household basket requires predictable availability and logistics

**Success for Them**

- Weekly/biweekly orders delivered reliably in 1–2 days (Austin: same-day as a premium)
- Typical order size: 15–30 items; $200–$350 basket
- Clear proof signals: certification + farm-to-door transparency + batch/harvest dates + tracking
- Loyalty rewards that make repeat ordering feel recognized and worthwhile

**Key Behaviors**

- Shops on a cadence (weekly/biweekly)
- Buys across categories: produce, meat, dairy, pantry staples (flour, honey, oils, etc.)
- Values trust and transparency over the lowest price

---

### Secondary Users

#### Segment: Small Restaurants & Cafes

**Profile / Needs**

- Places larger orders with lower frequency
- Values consistency, batch reliability, and predictable supply
- Cares about traceability and quality signals that can extend to their customers/menu

**Success**

- Smooth bulk ordering and dependable fulfillment timelines
- Visibility into availability and substitutions when needed
- Receipts/invoices and repeat ordering convenience

#### Segment: Meal-Preppers / Fitness-Focused Buyers

**Profile / Needs**

- Buys in volume, seeks clean protein and healthy vegetables
- Often optimizes for macros, ingredient integrity, and repeatable routines

**Success**

- Easy reorders, favorites, and clarity on product attributes
- Strong trust signals and consistent supply for routine-based purchasing

#### Segment: Gift Purchasers

**Profile / Needs**

- Buys curated organic baskets or corporate gifts
- Wants high perceived quality, premium presentation, and reliable delivery coordination

**Success**

- Gift flows (recipient address, message, scheduled delivery/pickup where applicable)
- Clear “premium/organic/local” signaling and polished checkout experience

---

### User Journey

#### Primary Buyer Journey: Health-First Parent

**Discovery**

- Finds FreeMarket via local-market presence, referrals, community groups, SEO/social, or “Texas organic delivery” searches

**Onboarding**

- Creates account (email or Google)
- Quickly trusts the shop via transparency signals:
  - farm-to-door messaging
  - organic certification proof
  - batch/harvest dates
  - clear delivery windows (Austin same-day, otherwise 1–2 days) + pickup option

**Core Usage**

- Weekly/biweekly replenishment: produce + meat/dairy + pantry
- Builds 15–30 item carts ($200–$350 typical)
- Uses favorites/reorder patterns and loyalty rewards as reinforcement loops

**Success Moment (“Aha”)**

- First delivery arrives on time and matches expectations for freshness
- Tracking + harvest/batch details remove doubt and build trust
- Loyalty rewards make “this is my default shop now” feel rational and rewarding

**Long-Term**

- Becomes the household’s consistent supply channel
- Trust + transparency + reliability drive repeat behavior more than discounts

## Success Metrics

### User Success Metrics

**Time-to-First-Value (TTFV) / First Session Success**

- Definition: user creates an account and completes a first order in **≤ 12 minutes**
- Target session breakdown:
  - Exploration: **3–5 min**
  - Register/Login: **≤ 2 min**
  - Add items to cart: **4–5 min**
  - Checkout: **≤ 2 min**
- Conversion target: **≥ 35–45%** of app traffic completes **sign-in + first order**

**Repeat Purchase / Retention (Cohort-Based)**

- Day 60 targets:
  - **40–50%** of customers have completed **≥ 2 orders**
  - **25–30%** weekly ordering pattern
  - **10–15%** biweekly ordering pattern
- Day 90 targets:
  - **55–65%** of customers have completed **≥ 2 orders**
  - **35–40%** weekly ordering pattern
  - **15–20%** biweekly ordering pattern
- RPR target: **≥ 50% by day 90**

**Delivery Experience / Service Reliability**

- On-time delivery rate: **≥ 96%**
- Failed + returned shipment rate: **< 2%**
- Failure resolution time (forwarding/refund/account credit): **≤ 24 hours**
- Customer perception goal: “If something fails, they solve it the very same day.”

**Trust & Transparency Signals (Observable Behaviors)**

- Harvest/batch dates are viewed and used as a confidence signal
- Tracking page usage indicates users rely on status visibility
- Loyalty engagement (enroll/use/redeem/earn) supports repeat purchasing
- Repeat purchase of the same product (same SKU) indicates trust + preference reinforcement

### Business Objectives

**3-Month Operational Success**

- Maintain growth toward **~20 orders/day** with stable fulfillment and support operations
- Establish FreeMarket as a trusted, owned channel for Texas-based D2C organic delivery

**3-Month Customer Base**

- Active customers (≥ 1 order in last 30 days): **180–250**
- Retention: **≥ 45–55%**
- Churn (acceptable): **≤ 10–12%**

### Key Performance Indicators

**Acquisition / Activation**

- Traffic → sign-in + first order conversion: **≥ 35–45%**
- Median TTFV (account created + first order): **≤ 12 minutes**

**Engagement / Retention**

- % customers with ≥ 2 orders by day 60: **40–50%**
- % customers with ≥ 2 orders by day 90: **55–65%**
- Weekly cadence adoption by day 90: **35–40%**
- Biweekly cadence adoption by day 90: **15–20%**
- RPR at day 90: **≥ 50%**
- Active customers at 3 months: **180–250**
- 3-month retention: **≥ 45–55%**
- 3-month churn: **≤ 10–12%**

**Operations / Reliability**

- On-time delivery: **≥ 96%**
- Failed+returned shipments: **< 2%**
- Failure resolution time: **≤ 24 hours**

**Trust Proxy Metrics**

- Harvest/batch date views per session and per order
- Tracking page views per active customer and per shipment
- Loyalty engagement rate and its correlation to repeat purchase
- Repeat SKU purchase rate

## MVP Scope

### Core Features

**Customer-facing (Shop)**

- Homepage (MVP):
  - Business info + announcements (hardcoded for MVP)
  - Promote harvest dates and/or promotions (hardcoded content for MVP)
- Navigation (MVP):
  - Navbar with routes for Home + Shop
  - Contact page deferred (link can be omitted in MVP)
- Shop:
  - Browse catalog by categories (once products exist)
  - Product detail pages with transparency fields (e.g., batch/harvest dates when provided)
  - Variants support (e.g., size/weight variants per SKU)
  - Cart with multi-product purchases
- Auth:
  - Email sign-in + Google sign-in
- Checkout v1:
  - Payment methods:
    - **Credit/Debit cards via Stripe** (Stripe **test mode** in development)
    - **PayPal** (PayPal **sandbox** in development)
  - Order creation must be resilient:
    - Support `pending_payment` → `paid` transitions for card/PayPal
    - Prevent silent failures (store provider IDs + status + timestamps)
- Discounts (MVP rules):
  - Discounts apply to **order subtotal** (before taxes, excluding delivery)
  - Discounts **can stack** (temporal discounts + loyalty discounts)
- Orders:
  - Customer order history + order details
- Shipments (MVP):
  - App sends external shipment API request (URL via env/config var)
  - On successful response: create shipment record in DB
  - Customer sees shipment status + any returned shipment metadata (if API returns it)

**Management/Admin (Back office)**

- Access-controlled management account(s)
- Product management:
  - Create/edit products, categories, variants
  - Configure temporal discounts (start/end windows)
- Inventory management:
  - Simple stock count per SKU
  - Manual stock updates by management (stock shown in shop)
- User management:
  - View/manage users and basic access controls
- Shipment management (MVP):
  - View all shipments and their details
  - Manually set statuses: **created, shipped, delivered, failed, returned**
  - Failed/returned flow (management-led):
    - Require a reason and resolution action (e.g., refund, reship, account credit)
    - Track timestamps for when status changed and when resolution completed
  - Display any shipment metadata returned by the external shipment API to management and customers

**Loyalty v1**

- First purchase incentive:
  - **15% discount** on first purchase if order subtotal is **≥ $250**
- Tier rewards (based on number of orders **> $70**):
  - At **5 orders**: **15%** discount on orders **≥ $100**
  - At **10 orders**: **20%** discount on orders **≥ $100**
  - At **15 orders**: **30%** discount on orders **≥ $100**
  - At **20 orders**: **40%** discount on orders **≥ $100**
- Loyalty rules are enforced server-side and visible in the account area
- Loyalty discounts can stack with temporal discounts (stacking still applies to subtotal only)

### Out of Scope for MVP

- Cash on Delivery (COD)
- Saved payment methods / one-click checkout
- Apple Pay / Google Pay
- Subscriptions / recurring payments
- Advanced fraud/risk scoring beyond provider defaults
- Automated shipment tracking updates (shipment status updates are manual in MVP)
- Full “Contact” page content (page planned shortly after MVP)
- Advanced analytics/reporting dashboards beyond basic operational views

### MVP Success Criteria

- Activation:
  - Account created + first order completed within **≤ 12 minutes**
  - **≥ 35–45%** of traffic completes sign-in + first order
- Retention:
  - Meets day 60/90 repeat purchase targets and **RPR ≥ 50% at day 90**
- Operations:
  - External shipment API call reliably creates shipments in DB
  - Manual shipment workflows (including failed/returned resolution) support the brand promise of same-day resolution
- Trust:
  - Users engage with transparency signals (harvest/batch dates when available) and tracking page
  - Loyalty engagement correlates with repeat orders

### Future Vision

- Expand payments (Apple Pay / Google Pay, saved methods) and strengthen fraud prevention + chargeback handling
- Automate shipment lifecycle updates (webhooks/polling) instead of manual status updates
- Expand management into full operations suite (carrier selection, labels, delivery SLAs)
- Add full Contact page and richer business content pages
- Deep analytics/reporting: sales dashboards, cohorts, best sellers, customer preferences
- Geographic expansion beyond Texas once ops + supply chain are stable
