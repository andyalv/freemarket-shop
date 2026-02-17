"use client";

import Link from "next/link";
import { MdAdd, MdClose, MdDeleteOutline, MdRemove, MdShoppingCart } from "react-icons/md";
import type { Product } from "./product-item-card";

type QuickCheckoutDrawerProps = {
  isOpen: boolean;
  cartItems: Product[];
  quantities: Record<number, number>;
  totalItems: number;
  subtotal: number;
  delivery: number;
  total: number;
  onOpen: () => void;
  onClose: () => void;
  onClearCart: () => void;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onQuantityInput: (productId: number, rawValue: string) => void;
  formatCurrency: (value: number) => string;
};

export function QuickCheckoutDrawer({
  isOpen,
  cartItems,
  quantities,
  totalItems,
  subtotal,
  delivery,
  total,
  onOpen,
  onClose,
  onClearCart,
  onIncrement,
  onDecrement,
  onQuantityInput,
  formatCurrency,
}: QuickCheckoutDrawerProps) {
  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open cart"
          className="fixed right-4 bottom-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--fm-color-clay)] bg-[var(--fm-color-clay)] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
        >
          <MdShoppingCart size={20} />
        </button>
      ) : null}

      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/35 transition-opacity ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      <aside
        aria-hidden={!isOpen}
        aria-label="Quick cart"
        className={`fixed top-0 right-0 z-[60] flex h-screen w-[380px] max-w-[92vw] flex-col border-l border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--fm-border)] p-4">
          <strong>Your cart</strong>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--fm-border)]"
            onClick={onClose}
            aria-label="Close quick cart"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="grid max-h-[calc(100vh-190px)] gap-3 overflow-auto p-4">
          {cartItems.length === 0 ? (
            <p className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-color-cream)] p-4 text-sm text-[var(--fm-text-muted)]">
              Your cart is empty. Add products to get started.
            </p>
          ) : (
            cartItems.map((product) => {
              const quantity = quantities[product.id] ?? 0;

              return (
                <div
                  key={product.id}
                  className="grid grid-cols-[64px_1fr] items-center gap-3 rounded-xl border border-[var(--fm-border)] p-3"
                >
                  <div className="h-16 w-16 rounded-lg border border-[var(--fm-border)] bg-[var(--fm-color-cream)]" />
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{product.name}</p>
                        <p className="text-xs text-[var(--fm-text-muted)]">{product.farm}</p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(product.price * quantity)}
                      </span>
                    </div>
                    <div className="mt-2 inline-flex items-center overflow-hidden rounded-[10px] border border-[var(--fm-border)]">
                      <button
                        type="button"
                        className="px-3 py-2 text-sm font-semibold"
                        onClick={() => onDecrement(product.id)}
                        aria-label={`Decrease ${product.name}`}
                      >
                        <MdRemove size={16} />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={String(quantity)}
                        onChange={(event) => onQuantityInput(product.id, event.target.value)}
                        aria-label={`Quantity for ${product.name}`}
                        className="h-9 w-10 border-x border-[var(--fm-border)] bg-transparent text-center text-sm font-semibold outline-none"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 text-sm font-semibold"
                        onClick={() => onIncrement(product.id)}
                        aria-label={`Increase ${product.name}`}
                      >
                        <MdAdd size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-auto border-t border-[var(--fm-border)] p-4">
          <button
            type="button"
            onClick={onClearCart}
            disabled={cartItems.length === 0}
            className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--fm-text-muted)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MdDeleteOutline size={18} />
            Clear cart
          </button>

          <div className="rounded-[14px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-3">
            <div className="flex items-center justify-between text-sm text-[var(--fm-text-muted)]">
              <span>Items ({totalItems})</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-[var(--fm-text-muted)]">
              <span>Delivery</span>
              <span>{formatCurrency(delivery)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Link
            href="/cart"
            aria-disabled={cartItems.length === 0}
            onClick={(event) => {
              if (cartItems.length === 0) {
                event.preventDefault();
              }
            }}
            className={`fm-btn fm-btn-primary mt-3 w-full ${
              cartItems.length === 0 ? "pointer-events-none cursor-not-allowed opacity-60" : ""
            }`}
          >
            Pay now
          </Link>
        </div>
      </aside>
    </>
  );
}

