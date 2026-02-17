
"use client";

import { useState } from "react";
import { ProductItemCard, type Product } from "./components/product-item-card";
import { ProductDetailPanel } from "./components/product-detail-panel";
import { QuickCheckoutDrawer } from "./components/quick-checkout-drawer";

const products: Product[] = [
  {
    id: 1,
    name: "Heirloom Tomatoes (1 lb)",
    farm: "Green Fork Farm",
    harvestLabel: "Harvested: Feb 7",
    price: 4.5,
    status: "fresh",
    description:
      "Rich, colorful tomatoes grown in mineral soil and picked at peak ripeness for salads and roasting.",
    origin: "Green Fork Farm, Fredericksburg, TX",
    batchHarvest: "Harvest lot GF-2402 · Feb 7",
    deliveryWindow: "2-3 days in Austin metro",
    farmerName: "Maya Rowan",
  },
  {
    id: 2,
    name: "Pasture Eggs (12)",
    farm: "Willow Ridge",
    harvestLabel: "Collected: Feb 8",
    price: 6,
    status: "limited",
    description:
      "Pasture-raised eggs with deep yolks and clean flavor from a small mixed-flock operation.",
    origin: "Willow Ridge, Bastrop, TX",
    batchHarvest: "Collection run WR-208 · Feb 8",
    deliveryWindow: "2-3 days in Austin metro",
    farmerName: "Eli Mercer",
  },
  {
    id: 3,
    name: "Strawberries (1 lb)",
    farm: "Sunvale Co-op",
    harvestLabel: "Harvested: Feb 6",
    price: 5.5,
    status: "out",
    description: "Early-season berries with bright sweetness and a soft finish.",
    origin: "Sunvale Co-op, Elgin, TX",
    batchHarvest: "Harvest lot SV-114 · Feb 6",
    deliveryWindow: "Next week",
    farmerName: "Ana Solis",
  },
  {
    id: 4,
    name: "Baby Kale (8 oz)",
    farm: "Cedar Lane",
    harvestLabel: "Harvested: Feb 7",
    price: 3.25,
    status: "fresh",
    description:
      "Tender baby kale with a mild bite, cleaned and packed same day for quick weeknight meals.",
    origin: "Cedar Lane, Pflugerville, TX",
    batchHarvest: "Harvest lot CL-522 · Feb 7",
    deliveryWindow: "2-3 days in Austin metro",
    farmerName: "Noah Pike",
  },
  {
    id: 5,
    name: "Rainbow Carrots (1 lb)",
    farm: "Hollow Creek",
    harvestLabel: "Harvested: Feb 7",
    price: 3.8,
    status: "fresh",
    description:
      "Sweet, crunchy heirloom carrot mix with natural color variation and strong earthy aroma.",
    origin: "Hollow Creek, Manor, TX",
    batchHarvest: "Harvest lot HC-309 · Feb 7",
    deliveryWindow: "2-3 days in Austin metro",
    farmerName: "Leah Benton",
  },
  {
    id: 6,
    name: "Goat Cheese (6 oz)",
    farm: "Silver Meadow",
    harvestLabel: "Batch: Feb 5",
    price: 7.75,
    status: "limited",
    description:
      "Small-batch chèvre with a creamy texture and subtle tang, made from pasture-fed milk.",
    origin: "Silver Meadow Creamery, Dripping Springs, TX",
    batchHarvest: "Cheese batch SM-2405 · Feb 5",
    deliveryWindow: "2-3 days in Austin metro",
    farmerName: "Ruth Calder",
  },
  {
    id: 7,
    name: "Blueberries (6 oz)",
    farm: "Riverlight Farm",
    harvestLabel: "Harvested: Feb 8",
    price: 4.9,
    status: "fresh",
    description:
      "Firm, sweet berries harvested in cool morning hours to preserve texture and flavor.",
    origin: "Riverlight Farm, Lockhart, TX",
    batchHarvest: "Harvest lot RL-420 · Feb 8",
    deliveryWindow: "2-3 days in Austin metro",
    farmerName: "Isaac Wynn",
  },
  {
    id: 8,
    name: "Sweet Corn (4 ears)",
    farm: "Prairie Bend",
    harvestLabel: "Harvested: Feb 4",
    price: 4.2,
    status: "out",
    description: "Fresh sweet corn picked at sugar peak for grilling and summer salads.",
    origin: "Prairie Bend, Taylor, TX",
    batchHarvest: "Harvest lot PB-197 · Feb 4",
    deliveryWindow: "Next week",
    farmerName: "Grace Holloway",
  },
];

const productById = new Map(products.map((product) => [product.id, product]));

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Shop() {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const formatCurrency = (value: number) => currencyFormatter.format(value);

  const setProductQuantity = (productId: number, nextQuantity: number) => {
    if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
      return;
    }

    const product = productById.get(productId);
    if (!product || product.status === "out") {
      return;
    }

    setQuantities((current) => {
      if (nextQuantity === 0) {
        if (!(productId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[productId];
        return next;
      }

      return { ...current, [productId]: nextQuantity };
    });
  };

  const increment = (productId: number) => {
    setQuantities((current) => {
      const product = productById.get(productId);
      if (!product || product.status === "out") {
        return current;
      }

      return { ...current, [productId]: (current[productId] ?? 0) + 1 };
    });
  };

  const decrement = (productId: number) => {
    setQuantities((current) => {
      const product = productById.get(productId);
      if (!product || product.status === "out") {
        return current;
      }

      const nextQuantity = Math.max((current[productId] ?? 0) - 1, 0);
      if (nextQuantity === 0) {
        if (!(productId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[productId];
        return next;
      }

      return { ...current, [productId]: nextQuantity };
    });
  };

  const onQuantityInput = (productId: number, rawValue: string) => {
    if (!/^\d*$/.test(rawValue)) {
      return;
    }

    if (rawValue === "") {
      setProductQuantity(productId, 0);
      return;
    }

    const nextQuantity = Number(rawValue);
    setProductQuantity(productId, nextQuantity);
  };

  const cartItems = products.filter((product) => (quantities[product.id] ?? 0) > 0);
  const totalItems = cartItems.reduce((sum, product) => sum + (quantities[product.id] ?? 0), 0);
  const subtotal = cartItems.reduce(
    (sum, product) => sum + product.price * (quantities[product.id] ?? 0),
    0,
  );
  const delivery = subtotal > 0 ? 4 : 0;
  const total = subtotal + delivery;
  const clearCart = () => setQuantities({});
  const selectedProduct =
    selectedProductId === null ? null : (productById.get(selectedProductId) ?? null);

  const onProductSelect = (productId: number) => {
    setSelectedProductId(productId);
  };

  const onDetailClose = () => {
    setSelectedProductId(null);
  };

  return (
    <div id="top">

      <section id="fresh" className="fm-container py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold">What&apos;s fresh this week</h2>
            <p className="mt-2 text-[var(--fm-text-muted)]">
              Hardcoded demo products based on the shop sample layout.
            </p>
          </div>
        </div>

        <div id="filters" className="mt-6 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-[var(--fm-border)] bg-[rgba(255,255,255,0.7)] px-3 py-2 text-sm font-medium">
            Category
            <select
              className="bg-transparent text-sm font-semibold outline-none"
              defaultValue="All"
              aria-label="Category"
            >
              <option>All</option>
              <option>Vegetables</option>
              <option>Fruits</option>
              <option>Dairy</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-2 rounded-full border border-[var(--fm-border)] bg-[rgba(255,255,255,0.7)] px-3 py-2 text-sm font-medium">
            Delivery window
            <select
              className="bg-transparent text-sm font-semibold outline-none"
              defaultValue="Any"
              aria-label="Delivery window"
            >
              <option>Any</option>
              <option>2-3 days</option>
              <option>Next week</option>
            </select>
          </label>

          <button
            type="button"
            className="rounded-xl border border-[var(--fm-border)] px-4 py-2 text-sm font-semibold text-[var(--fm-text-muted)]"
          >
            Clear filters
          </button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => {
            const quantity = quantities[product.id] ?? 0;

            return (
              <ProductItemCard
                key={product.id}
                product={product}
                quantity={quantity}
                onIncrement={increment}
                onDecrement={decrement}
                onQuantityInput={onQuantityInput}
                formatCurrency={formatCurrency}
                onSelect={onProductSelect}
              />
            );
          })}
        </div>

      </section>

      {selectedProduct ? (
        <ProductDetailPanel
          product={selectedProduct}
          quantity={quantities[selectedProduct.id] ?? 0}
          isVisible
          onIncrement={increment}
          onDecrement={decrement}
          onQuantityInput={onQuantityInput}
          onClose={onDetailClose}
          formatCurrency={formatCurrency}
        />
      ) : null}

      <QuickCheckoutDrawer
        isOpen={isCartOpen}
        cartItems={cartItems}
        quantities={quantities}
        totalItems={totalItems}
        subtotal={subtotal}
        delivery={delivery}
        total={total}
        onOpen={() => setIsCartOpen(true)}
        onClose={() => setIsCartOpen(false)}
        onClearCart={clearCart}
        onIncrement={increment}
        onDecrement={decrement}
        onQuantityInput={onQuantityInput}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
