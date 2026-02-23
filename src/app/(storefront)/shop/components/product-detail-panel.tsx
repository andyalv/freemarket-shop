"use client";

import { useEffect, useState } from "react";
import { MdAdd, MdCalendarMonth, MdClose, MdLocalShipping, MdLocationOn, MdPerson, MdRemove } from "react-icons/md";
import type { Product } from "./product-item-card";
import { formatBatchHarvest, formatCurrency } from "../utils/formatters";

type ProductDetailPanelProps = {
  product: Product;
  quantity: number;
  isVisible: boolean;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onQuantityInput: (productId: string, rawValue: string) => void;
  onClose: () => void;
};

export function ProductDetailPanel({
  product,
  quantity,
  isVisible,
  onIncrement,
  onDecrement,
  onQuantityInput,
  onClose,
}: ProductDetailPanelProps) {
  const isOut = product.status === "out";
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        isVisible && isMounted ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Close product detail"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      <section
        className={`absolute inset-x-4 top-1/2 mx-auto w-full max-w-5xl -translate-y-1/2 transition-opacity duration-300 ${
          isVisible && isMounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-[14px] border border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[0_6px_20px_rgba(0,0,0,0.1)] lg:grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative aspect-[4/3] bg-[var(--fm-color-cream)] lg:aspect-auto lg:min-h-[420px]">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close product detail"
              className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-text)] shadow-sm cursor-pointer"
            >
              <MdClose size={18} />
            </button>
          </div>

          <div className="border-t border-[var(--fm-border)] p-5 lg:border-t-0 lg:border-l">
            <h4 className="text-xl font-bold">{product.name}</h4>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-[var(--fm-text-muted)]">{product.farm}</span>
              <span className="font-bold">{formatCurrency(product.price)}</span>
            </div>
            <p className="mt-3 text-sm text-[var(--fm-text-muted)]">{product.description}</p>

            {isOut ? (
              <div className="mt-4">
                <button type="button" className="fm-btn fm-btn-secondary w-full" disabled>
                  Unavailable
                </button>
              </div>
            ) : (
              <div className="mt-4 inline-flex items-center overflow-hidden rounded-[10px] border border-[var(--fm-border)]">
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-semibold cursor-pointer"
                  onClick={function() { return onDecrement(product.id) }}
                  aria-label={`Decrease ${product.name}`}
                >
                  <MdRemove size={16} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={String(quantity)}
                  onChange={function(event) { return onQuantityInput(product.id, event.target.value) }}
                  aria-label={`Quantity for ${product.name}`}
                  className="h-9 w-12 border-x border-[var(--fm-border)] bg-transparent text-center text-sm font-semibold outline-none"
                />
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-semibold cursor-pointer"
                  onClick={function() { return onIncrement(product.id) }}
                  aria-label={`Increase ${product.name}`}
                >
                  <MdAdd size={16} />
                </button>
              </div>
            )}

            <div className="mt-5 border-t border-[var(--fm-border)] pt-4">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]">
                From the farm
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid grid-cols-[24px_1fr] gap-2 rounded-xl border border-[var(--fm-border)] bg-[#faf7f2] p-3">
                  <MdLocationOn className="mt-0.5 text-[var(--fm-color-sage)]" />
                  <p className="text-sm">
                    <strong>Origin:</strong> {product.origin}
                  </p>
                </div>
                <div className="grid grid-cols-[24px_1fr] gap-2 rounded-xl border border-[var(--fm-border)] bg-[#faf7f2] p-3">
                  <MdCalendarMonth className="mt-0.5 text-[var(--fm-color-sage)]" />
                  <p className="text-sm">
                    <strong>Batch/Harvest:</strong>{" "}
                    {formatBatchHarvest(product.batchHarvest, product.harvestDate)}
                  </p>
                </div>
                <div className="grid grid-cols-[24px_1fr] gap-2 rounded-xl border border-[var(--fm-border)] bg-[#faf7f2] p-3">
                  <MdLocalShipping className="mt-0.5 text-[var(--fm-color-sage)]" />
                  <p className="text-sm">
                    <strong>Delivery window:</strong> {product.deliveryWindow}
                  </p>
                </div>
                <div className="grid grid-cols-[24px_1fr] gap-2 rounded-xl border border-[var(--fm-border)] bg-[#faf7f2] p-3">
                  <MdPerson className="mt-0.5 text-[var(--fm-color-sage)]" />
                  <p className="text-sm">
                    <strong>Farmer:</strong> {product.farmerName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
