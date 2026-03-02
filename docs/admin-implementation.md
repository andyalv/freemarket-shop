# Admin Frontend Implementation Plan (Frontend-First)

## 1. Goal
Build the admin UI preview before backend work is finalized.

This implementation focuses on:
- Layout and page structure
- Component behavior and interaction
- Frontend-only state changes with mock/fake data
- API call wiring (even when endpoints are temporary stubs)

## 2. Execution Protocol (Agent Instructions)
Follow this workflow for every phase:
1. Implement only the current phase.
2. Share what was changed and what is still pending.
3. Ask for approval before moving to the next phase.
4. Mark checklist items complete only after approval.
5. Continue in numeric order.

## 3. References
- Admin visual reference: `/docs/page-samples/admin-sample.html`
- UX/Design specifications: `/docs/ux-design-specification.md`

## 4. Scope
### In scope now
- Admin shell: navbar + sidebar + route layout
- Dashboard preview components and composition
- Mock API routes for preview flows
- Client-side interactions (edit/delete/confirm/pagination)
- Responsive behavior for desktop and mobile

### Out of scope now
- Real backend persistence
- Real authentication/authorization guards
- Full business validation logic
- Production-grade analytics/reporting

## 5. Target Paths (Current Repo Structure)
- Admin layout: `src/app/(backoffice)/admin/layout.tsx`
- Admin dashboard page: `src/app/(backoffice)/admin/dashboard/page.tsx`
- Dashboard components: `src/app/(backoffice)/admin/dashboard/components/*`
- Shared admin components (recommended): `src/components/admin/*`
- Existing product API: `src/app/api/product/route.ts`
- Shipment API to add (preview only): `src/app/api/shipment/route.ts`

## 6. UI Requirements from Sample
### 6.1 Admin shell
- Sticky top navbar
- Sidebar links: Products, Inventory, Shipments, Orders, Users, Support
- Navbar avatar should be a filled circle placeholder (no image dependency)

### 6.2 Dashboard sections
The dashboard should include quick-overview blocks for:
- Products
- Inventory
- Shipments
- Orders

### 6.3 Required interactions
- Table row actions for view/edit/delete as applicable
- Confirm dialog for destructive actions (centered modal + dimmed backdrop)
- Drawer/panel interactions where relevant
- Pagination controls for list sections
- Loading, empty, and error states for API-driven components

## 7. Preview API Contracts
Use these contracts for frontend integration during preview mode.

### 7.1 Product list
- Endpoint: `GET /api/product?page={n}&limit={m}`
- Purpose: fill quick product overview table
- Notes: use current mock data source, but support pagination response

### 7.2 Product update
- Endpoint: `PATCH /api/product/{id}`
- Purpose: quick inline update flow
- Notes: no persistence required yet; UI should optimistically reflect changes

### 7.3 Product delete
- Endpoint: `DELETE /api/product/{id}`
- Purpose: delete flow after confirmation dialog
- Notes: frontend-only delete is acceptable in this phase

### 7.4 Shipment list
- Endpoint: `GET /api/shipment?page={n}&limit={m}`
- Purpose: fill quick shipment overview table
- Notes: create preview endpoint with at least 24 hardcoded records

### 7.5 Pagination rules
- Default page size: 24
- If `page` is missing: return page 1
- If `limit` is missing: use default (24)
- If `limit` is provided without `page`: return page 1 with provided limit

## 8. Phased Implementation Plan

### Phase 1 - Admin layout foundation (1.1)
Build core admin shell and route layout.

Deliverables:
- Navbar component
- Sidebar component
- Integrated layout wrapper in `admin/layout.tsx`
- Active link styling for current section

Definition of done:
- Dashboard renders inside admin layout
- Sidebar/nav matches sample structure
- Mobile behavior is usable (sidebar collapse or scroll-safe fallback)

Checklist:
- [ ] 1.1.1 Create admin navbar
- [ ] 1.1.2 Create admin sidebar
- [ ] 1.1.3 Wire components in `admin/layout.tsx`
- [ ] 1.1.4 Add responsive behavior

### Phase 2 - Dashboard page and quick overview components (1.2)
Build `/admin/dashboard` using modular components.

Deliverables:
- Dashboard page composition
- Quick overview components in `admin/dashboard/components`
- API hooks/fetchers and UI states

Definition of done:
- Each block renders real mock data from API routes
- Pagination works
- Edit/delete interactions are functional in preview mode

Checklist:
- [ ] 1.2.1 Create dashboard page scaffold
-Storefront [ ] 1.2.2 Build Quick Product Overview component
- [ ] 1.2.3 Build Quick Shipments Overview component
- [ ] 1.2.4 Build Quick Inventory Overview component (summary-only preview)
- [ ] 1.2.5 Build Quick Orders Overview component (summary-only preview)

### Phase 3 - Full admin section pages (recommended next)
Create complete visual admin pages linked from the sidebar, with richer detail panels and edit interfaces.

Deliverables:
- `/admin/products` with catalog table + product detail panel + product edit panel
- `/admin/inventory` with stock table + quick adjust panel + bulk update panel
- `/admin/shipments` with shipment table + status timeline panel + status edit panel
- `/admin/orders` with orders table + order summary panel + order status edit panel
- `/admin/users` with users table + profile detail panel + role/status edit panel
- `/admin/support` with tickets table + ticket detail panel + resolution edit panel

Definition of done:
- Every sidebar link resolves to a detailed page (not placeholder-only)
- Each page includes at least one read-only detail panel and one edit panel/drawer/modal
- Edit actions are frontend-preview only (no required persistence)
- Existing and newly created preview API calls are reused where applicable
- Shared admin UI primitives are reused (table, modal/drawer, pagination, badges)

Checklist:
- [ ] 1.3.1 Build Products page (details + edit panels)
- [ ] 1.3.2 Build Inventory page (details + edit panels)
- [ ] 1.3.3 Build Shipments page (details + edit panels)
- [ ] 1.3.4 Build Orders page (details + edit panels)
- [ ] 1.3.5 Build Users page (details + edit panels)
- [ ] 1.3.6 Build Support page (details + edit panels)
- [ ] 1.3.7 Reuse available API calls across all Phase 3 pages
- [ ] 1.3.8 Ensure all edit flows are visually complete in preview mode

### Phase 4 - Shared interaction components (recommended next)
Create reusable admin UI primitives to avoid duplication.

Deliverables:
- Confirm dialog component
- Reusable data table wrapper
- Pagination component
- Status badge component
- Empty/loading/error states

Definition of done:
- Dashboard and admin pages reuse shared primitives
- No duplicated modal/pagination logic across pages

Checklist:
- [ ] 1.4.1 Confirm dialog primitive
- [ ] 1.4.2 Pagination primitive
- [ ] 1.4.3 Status badge mapping
- [ ] 1.4.4 Empty/loading/error states
- [ ] 1.4.5 Reusable table actions cell

## 9. Quick Product Overview Requirements (Detailed)
- Fetch from `GET /api/product?page={n}&limit=5`
- Show paginated table and allow moving through all pages
- Row actions: View, Edit, Delete
- Delete flow:
  - Open centered confirmation modal
  - Dim/lock background while modal is open
  - Remove item only after confirmation
  - Prepare call to `DELETE /api/product/{id}`
- Edit flow:
  - Use quick-edit pattern similar to sample
  - Prepare call to `PATCH /api/product/{id}`
- Ignore from sample:
  - Variants button
  - Inventory button
  - Availability column

## 10. Quick Shipments Overview Requirements (Detailed)
- Build `GET /api/shipment` mock endpoint with pagination support
- Provide at least 24 fake shipment rows
- Minimum row fields:
  - Order
  - Customer
  - Status
  - Updated
- Fetch with `GET /api/shipment?page={n}&limit=5`
- Support pagination across all available mock rows

## 11. Acceptance Checklist (Cross-cutting)
- [ ] Admin dashboard matches sample intent and visual hierarchy
- [ ] Components are modular and easy to move to real backend later
- [ ] All API-driven sections include loading/empty/error states
- [ ] Mobile layout is usable
- [ ] No backend persistence assumptions block frontend preview

## 12. Open Decisions to Resolve Early
- Whether inventory/orders overview should use mock endpoints now or static previews
- Whether to include shipment detail drawer in dashboard phase or shipments page phase
