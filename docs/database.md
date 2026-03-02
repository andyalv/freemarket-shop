# Database design

This document defines the proposed database structure for the first functional shop version.
No migrations are being implemented yet.

## Naming rules

- Table names must be singular and `snake_case` (example: `farm`, `product_image`, `order_item`).
- Column names must be `snake_case`.
- IDs must be `uuid`.
- Monetary columns use `numeric(12,2)` with non-negative checks.
- Currency columns use `char(3)` and default to `USD`.

## Tables

- `farm`
- `category`
- `product`
- `product_image`
- `order`
- `order_item`

## Rules

### High-Level Relationships

- `farm` 1 -> many `product` through `product.origin_farm_id`
- `category` 1 -> many `product` through `product.category_id`
- `product` 1 -> many `product_image` through `product_image.product_id`
- `product` 0..1 -> 1 `product_image` through `product.primary_image`
- `order` 1 -> many `order_item` through `order_item.order_id`
- `product` 1 -> many `order_item` through `order_item.product_id`

### Currency rule

- `product.currency`, `order.currency`, and `order_item.currency` default to `USD`.
- Currency values must be 3-letter uppercase ISO 4217 codes.
- Validation should be enforced at write time using DB constraints and/or server-side validation.

### `farm`

Stores descriptive farm data for farm pages, location display, and product origin context.

| Column name | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique farm identifier. |
| `name` | `text` | not null | Public farm name. |
| `slug` | `text` | not null, unique | URL-safe identifier for farm routes. |
| `short_description` | `text` | not null | Short summary for cards/lists. |
| `description` | `text` | not null | Long-form farm details. |
| `location_name` | `text` | not null | Human-readable location label. |
| `address_line_1` | `text` | nullable | Optional primary street address. |
| `address_line_2` | `text` | nullable | Optional address complement. |
| `city` | `text` | not null | City for display/filtering. |
| `state_region` | `text` | not null | State/region for display/filtering. |
| `postal_code` | `text` | nullable | Optional postal code. |
| `country_code` | `char(2)` | not null, default `'US'` | ISO 3166-1 alpha-2 country code. |
| `latitude` | `numeric(9,6)` | nullable | Coordinate for maps. |
| `longitude` | `numeric(9,6)` | nullable | Coordinate for maps. |
| `size_hectares` | `numeric(10,2)` | nullable, check `> 0` | Farm size for showcasing scale. |
| `farming_practices` | `text[]` | nullable | Practices tags. |
| `certifications` | `text[]` | nullable | Certification tags/badges. |
| `website_url` | `text` | nullable | Optional farm website. |
| `cover_image_path` | `text` | nullable | Supabase Storage path for farm hero image. |
| `is_active` | `boolean` | not null, default `true` | Controls public visibility. |
| `created_at` | `timestamptz` | not null, default `now()` | Row creation timestamp. |
| `updated_at` | `timestamptz` | not null, default `now()` | Row last-update timestamp. |

- `id`: stores the unique UUID used to identify one farm record and link it from other tables.
- `name`: stores the farm name shown in product pages, farm cards, and farm detail pages.
- `slug`: stores a route-safe unique value used in URLs like `/farm/{slug}`.
- `short_description`: stores brief copy for previews and listing cards.
- `description`: stores full farm narrative content for the dedicated farm page.
- `location_name`: stores a user-friendly location string for quick display.
- `address_line_1`: stores optional primary street address data.
- `address_line_2`: stores optional address complement information.
- `city`: stores the city to support display and geographic filtering.
- `state_region`: stores the state/region to support display and filtering.
- `postal_code`: stores optional postal code data.
- `country_code`: stores the country code in ISO 3166-1 alpha-2 format.
- `latitude`: stores latitude for map placement and geospatial features.
- `longitude`: stores longitude for map placement and geospatial features.
- `size_hectares`: stores farm size to display operational scale.
- `farming_practices`: stores practice labels such as regenerative or low-till.
- `certifications`: stores farm certification labels for trust and transparency.
- `website_url`: stores an optional external farm website link.
- `cover_image_path`: stores the path to the farm cover image in Supabase Storage.
- `is_active`: stores whether the farm should be visible in storefront contexts.
- `created_at`: stores when the row was created.
- `updated_at`: stores when the row was last modified.

```json
{
  "id": "b0630409-f89d-4939-81a4-29db8cb9f839",
  "name": "Green Fork Farm",
  "slug": "green-fork-farm",
  "short_description": "Small regenerative farm focused on seasonal produce.",
  "description": "Family-operated farm with crop rotation and low-till practices.",
  "location_name": "Fredericksburg, TX",
  "address_line_1": null,
  "address_line_2": null,
  "city": "Fredericksburg",
  "state_region": "TX",
  "postal_code": "78624",
  "country_code": "US",
  "latitude": 30.2752,
  "longitude": -98.8719,
  "size_hectares": 18.5,
  "farming_practices": ["regenerative", "low_till"],
  "certifications": ["organic"],
  "website_url": "https://greenfork.example",
  "cover_image_path": "farm/green-fork/cover.jpg",
  "is_active": true,
  "created_at": "2026-02-20T14:22:00Z",
  "updated_at": "2026-02-20T14:22:00Z"
}
```

### `category`

Stores available product categories (minimal structure: id + name).

| Column name | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique category identifier. |
| `name` | `text` | not null, unique | Category label used in UI filters. |

- `id`: stores the unique UUID for a category record.
- `name`: stores the category value used for labeling and filtering products.

```json
{
  "id": "891e5fe9-96d5-46df-a3cb-c4ff677cc54b",
  "name": "vegetables"
}
```

### `product`

Stores sellable items with farm/category links, base pricing, inventory amount, and primary image reference.

| Column name | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique product identifier. |
| `name` | `text` | not null | Product display name. |
| `slug` | `text` | not null, unique | URL-safe identifier for product routes. |
| `description` | `text` | not null | Product description content. |
| `origin_farm_id` | `uuid` | not null, FK -> `farm(id)` | Farm that produced this product. |
| `category_id` | `uuid` | not null, FK -> `category(id)` | Product category relation. |
| `base_price` | `numeric(12,2)` | not null, check `>= 0` | Base product price amount. |
| `currency` | `char(3)` | not null, default `'USD'` | ISO 4217 currency code. |
| `quantity_stock` | `integer` | not null, default `0`, check `>= 0` | Available inventory amount. |
| `primary_image` | `uuid` | nullable, FK -> `product_image(id)` | Primary image reference for quick storefront rendering. |
| `unit_label` | `text` | nullable | Unit text like `1 lb` or `12 eggs`. |
| `is_active` | `boolean` | not null, default `true` | Controls storefront visibility. |
| `created_at` | `timestamptz` | not null, default `now()` | Row creation timestamp. |
| `updated_at` | `timestamptz` | not null, default `now()` | Row last-update timestamp. |

- `id`: stores the unique UUID for each product.
- `name`: stores the product title displayed in listings and detail pages.
- `slug`: stores the route-safe unique value used in product URLs.
- `description`: stores long-form product detail content.
- `origin_farm_id`: stores the farm UUID that identifies product origin.
- `category_id`: stores the category UUID used for product classification.
- `base_price`: stores the base unit price used as starting product pricing.
- `currency`: stores the ISO 4217 currency code for `base_price`, defaulting to `USD`.
- `quantity_stock`: stores how many units currently exist and are available.
- `primary_image`: stores the UUID of the primary image row used by product cards and detail headers.
- `unit_label`: stores the human-readable sold unit.
- `is_active`: stores whether the product should be visible/sellable.
- `created_at`: stores when the row was created.
- `updated_at`: stores when the row was last modified.

```json
{
  "id": "f1c8fa42-6f35-49cf-9f6f-9d22a9fe6301",
  "name": "Heirloom Tomatoes",
  "slug": "heirloom-tomatoes-1-lb",
  "description": "Rich, colorful tomatoes picked at peak ripeness.",
  "origin_farm_id": "b0630409-f89d-4939-81a4-29db8cb9f839",
  "category_id": "891e5fe9-96d5-46df-a3cb-c4ff677cc54b",
  "base_price": 4.5,
  "currency": "USD",
  "quantity_stock": 120,
  "primary_image": "8f302dc1-7f7e-4509-a2f6-6b89e89e8ef0",
  "unit_label": "1 lb",
  "is_active": true,
  "created_at": "2026-02-20T14:22:00Z",
  "updated_at": "2026-02-20T14:22:00Z"
}
```

### `product_image`

Stores one-to-many product image references using Supabase Storage file paths.

| Column name | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique product image identifier, also referenced by `product.primary_image`. |
| `product_id` | `uuid` | not null, FK -> `product(id)`, on delete cascade | Parent product relation. |
| `path` | `text` | not null | Storage file path for image. |
| `alt_text` | `text` | nullable | Accessibility/SEO description. |
| `created_at` | `timestamptz` | not null, default `now()` | Row creation timestamp. |

- `id`: stores the unique UUID for each product image row.
- `product_id`: stores the UUID of the product that owns this image.
- `path`: stores the Supabase Storage path that resolves to the image asset under `/product_images/{product_id}/`.
- `alt_text`: stores descriptive text for accessibility and image context.
- `created_at`: stores when the image row was created.

```json
{
  "id": "8f302dc1-7f7e-4509-a2f6-6b89e89e8ef0",
  "product_id": "f1c8fa42-6f35-49cf-9f6f-9d22a9fe6301",
  "path": "/product_images/f1c8fa42-6f35-49cf-9f6f-9d22a9fe6301/main.jpg",
  "alt_text": "Fresh heirloom tomatoes in crate",
  "created_at": "2026-02-20T14:22:00Z"
}
```

### `order`

Stores order-level monetary summary values.

| Column name | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique order identifier. |
| `total` | `numeric(12,2)` | not null, check `>= 0` | Final order amount. |
| `currency` | `char(3)` | not null, default `'USD'` | ISO 4217 code for order amount. |
| `created_at` | `timestamptz` | not null, default `now()` | Row creation timestamp. |

- `id`: stores the unique UUID for each order.
- `total`: stores the final order total value.
- `currency`: stores the ISO 4217 currency code for `total`, defaulting to `USD`.
- `created_at`: stores when the order row was created.

```json
{
  "id": "69a13f8d-566a-46fa-bf7b-a57d9412f085",
  "total": 13.5,
  "currency": "USD",
  "created_at": "2026-02-20T15:10:00Z"
}
```

### `order_item`

Stores purchased product lines per order, including captured per-unit price and quantity.

| Column name | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique line-item identifier. |
| `order_id` | `uuid` | not null, FK -> `order(id)`, on delete cascade | Parent order relation. |
| `product_id` | `uuid` | not null, FK -> `product(id)` | Purchased product relation. |
| `price` | `numeric(12,2)` | not null, check `>= 0` | Per-unit price at purchase time. |
| `currency` | `char(3)` | not null, default `'USD'` | ISO 4217 code for item price. |
| `quantity` | `integer` | not null, check `> 0` | Purchased quantity. |
| `created_at` | `timestamptz` | not null, default `now()` | Row creation timestamp. |

- `id`: stores the unique UUID for each order item.
- `order_id`: stores the UUID of the order that owns this line item.
- `product_id`: stores the UUID of the purchased product.
- `price`: stores the per-unit price snapshot taken at checkout.
- `currency`: stores the ISO 4217 currency code for `price`, defaulting to `USD`.
- `quantity`: stores how many units of the product were purchased.
- `created_at`: stores when the order item row was created.

```json
{
  "id": "9310b3ff-3945-4428-b8af-e91373f43559",
  "order_id": "69a13f8d-566a-46fa-bf7b-a57d9412f085",
  "product_id": "f1c8fa42-6f35-49cf-9f6f-9d22a9fe6301",
  "price": 4.5,
  "currency": "USD",
  "quantity": 3,
  "created_at": "2026-02-20T15:10:00Z"
}
```

# Notes for implementation

- Add DB checks for uppercase 3-letter currency codes.
- Enforce full ISO 4217 validity at write time (DB function/check and/or server-side validation).
- Add indexes on foreign keys:
  - `product.origin_farm_id`
  - `product.category_id`
  - `product_image.product_id`
  - `order_item.order_id`
  - `order_item.product_id`
- Create one Supabase Storage bucket for product images named `product_images`.
- Store product images inside a directory by product UUID:
  - `/product_images/{product_id}/{file_name}`
  - Example directory prefix: `/product_images/428865ed-c34e-41c2-a2ba-091d3bb42a77/`
- Save image object paths in `product_image.path`.
- Save the selected default image UUID in `product.primary_image` (FK -> `product_image.id`).
- Add a DB constraint to ensure `product.primary_image` belongs to the same product.
- Add an `updated_at` trigger for mutable tables that include `updated_at`.
