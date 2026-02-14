export default function Home() {
  return (
    <div id="top">
      <section
        className="border-b border-[var(--fm-border)]"
        style={{ background: "var(--fm-gradient-hero)" }}
      >
        <div className="fm-container grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h1
              className="text-4xl leading-tight sm:text-5xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Fresh, local, and honestly good.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[var(--fm-text-muted)]">
              Shop this week&apos;s organic picks from nearby farms with clear provenance and delivery
              windows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="fm-btn fm-btn-primary" href="#fresh">
                Shop what&apos;s fresh
              </a>
              <a className="fm-btn fm-btn-secondary" href="#products">
                See products
              </a>
            </div>
          </div>

          <div className="rounded-[14px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]">
              This week
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[var(--fm-text)]">Garden picks</h2>
            <ul className="mt-4 space-y-2 text-[var(--fm-text-muted)]">
              <li>Heirloom Tomatoes</li>
              <li>Pasture Eggs</li>
              <li>Baby Kale</li>
              <li>Raw Wildflower Honey</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
