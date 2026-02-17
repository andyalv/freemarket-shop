"use client";

import { MdAdd, MdRemove } from "react-icons/md";

export type ProductStatus = "fresh" | "limited" | "out";

export type Product = {
  id: number;
  name: string;
  farm: string;
  harvestLabel: string;
  price: number;
  status: ProductStatus;
  description: string;
  origin: string;
  batchHarvest: string;
  deliveryWindow: string;
  farmerName: string;
};

type ProductItemCardProps = {
  product: Product;
  quantity: number;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onQuantityInput: (productId: number, rawValue: string) => void;
  formatCurrency: (value: number) => string;
  onSelect: (productId: number) => void;
};

const badgeStyles: Record<ProductStatus, string> = {
  fresh:
    "border border-[rgba(21,128,61,0.25)] bg-[rgba(21,128,61,0.12)] text-[var(--fm-color-garden-cta)]",
  limited:
    "border border-[rgba(166,138,100,0.38)] bg-[rgba(166,138,100,0.18)] text-[var(--fm-color-clay)]",
  out: "border border-[rgba(185,74,72,0.35)] bg-[rgba(185,74,72,0.14)] text-[#8b2f2d]",
};

const badgeLabels: Record<ProductStatus, string> = {
  fresh: "Picked this week",
  limited: "Limited",
  out: "Out of stock",
};

export function ProductItemCard({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onQuantityInput,
  formatCurrency,
  onSelect,
}: ProductItemCardProps) {
  const isOut = product.status === "out";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={function() { return onSelect(product.id) }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(product.id);
        }
      }}
      className="flex cursor-pointer flex-col overflow-hidden rounded-[14px] border border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
    >
      <div
        className={`relative aspect-[4/3] border-b border-[var(--fm-border)] bg-[var(--fm-color-cream)] p-3 ${
          isOut ? "opacity-70 grayscale-[0.2]" : ""
        }`}
      >
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeStyles[product.status]}`}
        >
          {badgeLabels[product.status]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-bold leading-snug">{product.name}</h3>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-semibold text-[var(--fm-text-muted)]">{product.farm}</span>
          <span className="font-bold">{formatCurrency(product.price)}</span>
        </div>
        <p className="text-sm text-[var(--fm-text-muted)]">{product.harvestLabel}</p>

        <div
          className="mt-auto flex items-center justify-end gap-2 pt-2"
          onClick={function(event) { return event.stopPropagation() }}
          onKeyDown={function(event) { return event.stopPropagation() }}
        >
          {isOut ? (
            <button type="button" className="fm-btn fm-btn-secondary w-full" disabled>
              Unavailable
            </button>
          ) : quantity === 0 ? (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--fm-color-clay)] bg-[var(--fm-color-clay)] text-lg font-bold text-white"
              onClick={function() { return onIncrement(product.id) }}
              aria-label={`Add ${product.name}`}
            >
              <MdAdd size={20} />
            </button>
          ) : (
            <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-[var(--fm-border)]">
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
          )}
        </div>
      </div>
    </article>
  );
}
