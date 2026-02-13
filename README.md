# FreeMarket Shop

B2C e-commerce platform for a Texas-based organic farm to sell directly to customers online.

## What This Project Does

FreeMarket Shop provides an owned online sales channel for browsing products, placing orders, and managing fulfillment, while giving the business full control over catalog, pricing, inventory, customers, and operations.

Core product goals:
- Enable direct-to-consumer organic food ordering in Texas
- Support modern shopping flow: catalog, cart, checkout, account
- Support operations: product/inventory management and shipment tracking
- Support growth through loyalty incentives and repeat purchasing

## Technology Stack

- Frontend: React + React Router
- Backend platform: Supabase (Postgres, Auth, Storage, APIs)
- UI: Tailwind CSS + shadcn/ui
- Runtime/tooling: Bun
- Payments: Stripe (cards) + PayPal
- Integrations: External shipment service API (shipment creation/tracking data)

## MVP Scope (High Level)

- Customer: browse shop, view product details (including harvest/batch transparency fields), manage cart, authenticate (email/Google), checkout, view orders and shipment status
- Admin: manage products, categories, variants, stock, users, and shipment statuses
- Loyalty v1: tier-based and first-purchase discounts

## For reference

- `docs/`
