
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductItemCard, type Product } from "./components/product-item-card";
import { ProductDetailPanel } from "./components/product-detail-panel";
import { QuickCheckoutDrawer } from "./components/quick-checkout-drawer";
import {
  entriesToQuantities,
  quantitiesToEntries,
  readCartEntries,
  writeCartEntries,
} from "./utils/cart-storage";

export default function Shop() {
  const DETAIL_ANIMATION_MS = 300;
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDeliveryWindow, setSelectedDeliveryWindow] = useState("any");
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    entriesToQuantities(readCartEntries()),
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const closeDetailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        const response = await fetch("/api/product");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid API response");
        }

        if (isMounted) {
          setProducts(data as Product[]);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProductsError(error instanceof Error ? error.message : "Unable to load products");
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    writeCartEntries(quantitiesToEntries(quantities));
  }, [quantities]);

  useEffect(() => {
    return () => {
      if (closeDetailTimerRef.current) {
        clearTimeout(closeDetailTimerRef.current);
      }
    };
  }, []);

  const setProductQuantity = (productId: string, nextQuantity: number) => {
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

  const increment = (productId: string) => {
    setQuantities((current) => {
      const product = productById.get(productId);
      if (!product || product.status === "out") {
        return current;
      }

      return { ...current, [productId]: (current[productId] ?? 0) + 1 };
    });
  };

  const decrement = (productId: string) => {
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

  const onQuantityInput = (productId: string, rawValue: string) => {
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
  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category)))
        .filter(Boolean)
        .sort(),
    [products],
  );
  const deliveryWindowOptions = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.deliveryWindow)))
        .filter(Boolean)
        .sort(),
    [products],
  );
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory =
          selectedCategory === "all" ? true : product.category === selectedCategory;
        const matchesDelivery =
          selectedDeliveryWindow === "any"
            ? true
            : product.deliveryWindow === selectedDeliveryWindow;

        return matchesCategory && matchesDelivery;
      }),
    [products, selectedCategory, selectedDeliveryWindow],
  );
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

  const onProductSelect = (productId: string) => {
    if (closeDetailTimerRef.current) {
      clearTimeout(closeDetailTimerRef.current);
      closeDetailTimerRef.current = null;
    }

    setSelectedProductId(productId);
    setIsDetailVisible(true);
  };

  const onDetailClose = () => {
    if (closeDetailTimerRef.current) {
      clearTimeout(closeDetailTimerRef.current);
      closeDetailTimerRef.current = null;
    }

    setIsDetailVisible(false);
    closeDetailTimerRef.current = setTimeout(() => {
      setSelectedProductId(null);
      closeDetailTimerRef.current = null;
    }, DETAIL_ANIMATION_MS);
  };

  return (
    <div id="top">

      <section id="fresh" className="fm-container py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold">Shop</h2>
          </div>
        </div>

        <div id="filters" className="mt-6 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-[var(--fm-border)] bg-[rgba(255,255,255,0.7)] px-3 py-2 text-sm font-medium">
            Category
            <select
              className="bg-transparent text-sm font-semibold outline-none"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              aria-label="Category"
            >
              <option value="all">All</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-2 rounded-full border border-[var(--fm-border)] bg-[rgba(255,255,255,0.7)] px-3 py-2 text-sm font-medium">
            Delivery window
            <select
              className="bg-transparent text-sm font-semibold outline-none"
              value={selectedDeliveryWindow}
              onChange={(event) => setSelectedDeliveryWindow(event.target.value)}
              aria-label="Delivery window"
            >
              <option value="any">Any</option>
              {deliveryWindowOptions.map((window) => (
                <option key={window} value={window}>
                  {window}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedDeliveryWindow("any");
            }}
            disabled={selectedCategory === "all" && selectedDeliveryWindow === "any"}
            className="rounded-xl border border-[var(--fm-border)] px-4 py-2 text-sm font-semibold text-[var(--fm-text-muted)]"
          >
            Clear filters
          </button>
        </div>

        {productsLoading ? (
          <p className="mt-6 text-sm text-[var(--fm-text-muted)]">Loading products...</p>
        ) : productsError ? (
          <p className="mt-6 text-sm text-[#8b2f2d]">Failed to load products: {productsError}</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const quantity = quantities[product.id] ?? 0;

              return (
                <ProductItemCard
                  key={product.id}
                  product={product}
                  quantity={quantity}
                  onIncrement={increment}
                  onDecrement={decrement}
                  onQuantityInput={onQuantityInput}
                  onSelect={onProductSelect}
                />
              );
            })}
          </div>
        )}
        {!productsLoading && !productsError && filteredProducts.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--fm-text-muted)]">
            No products match the selected filters.
          </p>
        ) : null}

      </section>

      {selectedProduct ? (
        <ProductDetailPanel
          product={selectedProduct}
          quantity={quantities[selectedProduct.id] ?? 0}
          isVisible={isDetailVisible}
          onIncrement={increment}
          onDecrement={decrement}
          onQuantityInput={onQuantityInput}
          onClose={onDetailClose}
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
      />
    </div>
  );
}

