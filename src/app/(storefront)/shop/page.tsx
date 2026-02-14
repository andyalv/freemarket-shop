
type ProductStatus = "fresh" | "limited" | "out";

type Product = {
  id: number;
  name: string;
  farm: string;
  harvestLabel: string;
  price: string;
  status: ProductStatus;
};

const products: Product[] = [
  {
    id: 1,
    name: "Heirloom Tomatoes (1 lb)",
    farm: "Green Fork Farm",
    harvestLabel: "Harvested: Feb 7",
    price: "$4.50",
    status: "fresh",
  },
  {
    id: 2,
    name: "Pasture Eggs (12)",
    farm: "Willow Ridge",
    harvestLabel: "Collected: Feb 8",
    price: "$6.00",
    status: "limited",
  },
  {
    id: 3,
    name: "Strawberries (1 lb)",
    farm: "Sunvale Co-op",
    harvestLabel: "Harvested: Feb 6",
    price: "$5.50",
    status: "out",
  },
  {
    id: 4,
    name: "Baby Kale (8 oz)",
    farm: "Cedar Lane",
    harvestLabel: "Harvested: Feb 7",
    price: "$3.25",
    status: "fresh",
  },
  {
    id: 5,
    name: "Rainbow Carrots (1 lb)",
    farm: "Hollow Creek",
    harvestLabel: "Harvested: Feb 7",
    price: "$3.80",
    status: "fresh",
  },
  {
    id: 6,
    name: "Goat Cheese (6 oz)",
    farm: "Silver Meadow",
    harvestLabel: "Batch: Feb 5",
    price: "$7.75",
    status: "limited",
  },
  {
    id: 7,
    name: "Blueberries (6 oz)",
    farm: "Riverlight Farm",
    harvestLabel: "Harvested: Feb 8",
    price: "$4.90",
    status: "fresh",
  },
  {
    id: 8,
    name: "Sweet Corn (4 ears)",
    farm: "Prairie Bend",
    harvestLabel: "Harvested: Feb 4",
    price: "$4.20",
    status: "out",
  },
];

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

export default function Shop() {
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
            const isOut = product.status === "out";

            return (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-[14px] border border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
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
                    <span className="font-bold">{product.price}</span>
                  </div>
                  <p className="text-sm text-[var(--fm-text-muted)]">{product.harvestLabel}</p>

                  <div className="mt-2 flex items-center gap-2">
                    {isOut ? (
                      <button type="button" className="fm-btn fm-btn-secondary w-full" disabled>
                        Unavailable
                      </button>
                    ) : (
                      <>
                        <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-[var(--fm-border)]">
                          <button type="button" className="px-3 py-2 text-sm" aria-label="Decrease">
                            -
                          </button>
                          <span className="px-3 py-2 text-sm">1</span>
                          <button type="button" className="px-3 py-2 text-sm" aria-label="Increase">
                            +
                          </button>
                        </div>
                        <button type="button" className="fm-btn fm-btn-primary grow">
                          Add to cart
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
