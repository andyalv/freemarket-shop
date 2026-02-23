"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  MdCalendarMonth,
  MdCheckCircle,
  MdInfoOutline,
  MdLocalShipping,
  MdLocationOn,
  MdWarningAmber,
} from "react-icons/md";

type TrackingStatus = "created" | "shipped" | "delivered" | "failed" | "returned";

type TrackingStep = {
  id: string;
  title: string;
  timestamp: string;
  detail?: string;
  tone?: "normal" | "warning";
};

type TrackableOrder = {
  orderId: string;
  email: string;
  placedOn: string;
  eta: string;
  destination: string;
  deliveryWindow: string;
  status: TrackingStatus;
  statusLabel: string;
  carrier: string;
  nextAction: string;
  resolution?: string;
  timeline: TrackingStep[];
};

const mockOrders: TrackableOrder[] = [
  {
    orderId: "FM-482193",
    email: "customer@example.com",
    placedOn: "February 12, 2026",
    eta: "February 15, 2026",
    destination: "South Congress, Austin, TX",
    deliveryWindow: "2-3 days",
    status: "shipped",
    statusLabel: "In transit",
    carrier: "Austin Local Carrier",
    nextAction: "No action needed. Your delivery is on schedule.",
    timeline: [
      {
        id: "created",
        title: "Order created",
        timestamp: "Feb 12, 2026, 9:18 AM",
        detail: "Payment verified and order packed for pickup.",
      },
      {
        id: "shipped",
        title: "Shipment departed local hub",
        timestamp: "Feb 13, 2026, 3:42 PM",
        detail: "Your order is on the way to the final delivery route.",
      },
    ],
  },
  {
    orderId: "FM-517004",
    email: "guest@example.com",
    placedOn: "February 11, 2026",
    eta: "Pending address update",
    destination: "North Loop, Austin, TX",
    deliveryWindow: "2-3 days",
    status: "failed",
    statusLabel: "Delivery issue",
    carrier: "Austin Local Carrier",
    nextAction: "Confirm your address so we can reship quickly.",
    resolution: "Address mismatch detected during last-mile verification. Shipment is on hold.",
    timeline: [
      {
        id: "created",
        title: "Order created",
        timestamp: "Feb 11, 2026, 10:05 AM",
        detail: "Payment verified and items moved to shipping prep.",
      },
      {
        id: "failed",
        title: "Shipment failed",
        timestamp: "Feb 12, 2026, 5:20 PM",
        detail: "Address verification failed before delivery handoff.",
        tone: "warning",
      },
    ],
  },
];

function statusTone(status: TrackingStatus) {
  if (status === "failed" || status === "returned") {
    return "text-[#8b2f2d] border-[#b94a48]/35 bg-[#fff4f3]";
  }

  if (status === "delivered") {
    return "text-[var(--fm-color-garden-cta)] border-[rgba(21,128,61,0.28)] bg-[rgba(21,128,61,0.08)]";
  }

  return "text-[var(--fm-color-forest)] border-[var(--fm-border)] bg-[#faf7f2]";
}

export default function TrackingPage() {
  const [orderIdInput, setOrderIdInput] = useState("FM-482193");
  const [emailInput, setEmailInput] = useState("customer@example.com");
  const [lookupOrderId, setLookupOrderId] = useState("FM-482193");
  const [lookupEmail, setLookupEmail] = useState("customer@example.com");

  const activeOrder = useMemo(() => {
    const normalizedOrderId = lookupOrderId.trim().toUpperCase();
    const normalizedEmail = lookupEmail.trim().toLowerCase();

    return (
      mockOrders.find(
        (order) =>
          order.orderId.toUpperCase() === normalizedOrderId &&
          order.email.toLowerCase() === normalizedEmail,
      ) ?? null
    );
  }, [lookupEmail, lookupOrderId]);

  const onLookupSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLookupOrderId(orderIdInput);
    setLookupEmail(emailInput);
  };

  return (
    <div id="tracking">
      <section
        className="border-b border-[var(--fm-border)]"
        style={{ background: "var(--fm-gradient-hero)" }}
      >
        <div className="fm-container py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]">
            Order tracking
          </p>
          <h1
            className="mt-2 text-4xl leading-tight sm:text-5xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Stay confident after checkout
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--fm-text-muted)] sm:text-base">
            Track by order ID and email, view timestamped updates, and get clear next steps if a
            shipment is delayed, failed, or returned.
          </p>
        </div>
      </section>

      <section className="fm-container py-10">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[14px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <h2 className="text-2xl font-bold">Find your order</h2>
            <p className="mt-2 text-sm text-[var(--fm-text-muted)]">
              Guest lookup is supported. Use your order confirmation details.
            </p>

            <form onSubmit={onLookupSubmit} className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                Order ID
                <input
                  required
                  value={orderIdInput}
                  onChange={(event) => setOrderIdInput(event.target.value)}
                  className="rounded-xl border border-[var(--fm-border)] bg-white px-3 py-2 outline-none focus:border-[var(--fm-color-tan)]"
                />
              </label>
              <label className="grid gap-1 text-sm">
                Email used at checkout
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  className="rounded-xl border border-[var(--fm-border)] bg-white px-3 py-2 outline-none focus:border-[var(--fm-color-tan)]"
                />
              </label>

              <button type="submit" className="fm-btn fm-btn-primary mt-2 w-full">
                Track order
              </button>
            </form>

            <div className="mt-4 rounded-xl border border-[var(--fm-border)] bg-[#faf7f2] p-3 text-xs text-[var(--fm-text-muted)]">
              Demo lookups: <strong>FM-482193 / customer@example.com</strong> or{" "}
              <strong>FM-517004 / guest@example.com</strong>
            </div>
          </article>

          {activeOrder ? (
            <article className="rounded-[14px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]">
                    Active shipment
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">{activeOrder.orderId}</h2>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${statusTone(activeOrder.status)}`}
                >
                  {activeOrder.statusLabel}
                </span>
              </div>

              <div className="mt-4 grid gap-3 rounded-xl border border-[var(--fm-border)] bg-[#faf7f2] p-3 text-sm sm:grid-cols-2">
                <p>
                  <strong>Placed:</strong> {activeOrder.placedOn}
                </p>
                <p>
                  <strong>Delivery window:</strong> {activeOrder.deliveryWindow}
                </p>
                <p>
                  <strong>ETA:</strong> {activeOrder.eta}
                </p>
                <p>
                  <strong>Carrier:</strong> {activeOrder.carrier}
                </p>
              </div>

              <p className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--fm-text-muted)]">
                <MdLocationOn size={17} />
                {activeOrder.destination}
              </p>

              <div className="mt-4 rounded-xl border border-[var(--fm-border)] bg-white p-3 text-sm">
                <p className="inline-flex items-center gap-2 font-semibold">
                  <MdInfoOutline size={18} />
                  What happens next
                </p>
                <p className="mt-1 text-[var(--fm-text-muted)]">{activeOrder.nextAction}</p>
              </div>
            </article>
          ) : (
            <article className="rounded-[14px] border border-[#b94a48]/30 bg-[#fff4f3] p-5 text-[#8b2f2d] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <h2 className="text-xl font-bold">Order not found</h2>
              <p className="mt-2 text-sm">
                We could not match that order ID and email. Check your confirmation email, then try
                again.
              </p>
              <p className="mt-3 text-sm">
                If you still need help, contact support with your checkout date and full name.
              </p>
            </article>
          )}
        </div>

        <div className="mt-6 rounded-[14px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="text-2xl font-bold">Timeline</h2>
          <p className="mt-1 text-sm text-[var(--fm-text-muted)]">
            Each update shows what changed and what to do next.
          </p>

          {activeOrder ? (
            <div className="mt-5 space-y-4">
              <ol className="relative ml-2 border-l-2 border-[rgba(65,72,51,0.18)] pl-6">
                {activeOrder.timeline.map((step) => (
                  <li key={step.id} className="relative">
                    <span
                      className={`absolute -left-[33px] top-1.5 inline-flex h-3.5 w-3.5 rounded-full border-2 border-white ${
                        step.tone === "warning"
                          ? "bg-[var(--fm-color-error)] shadow-[0_0_0_2px_rgba(185,74,72,0.25)]"
                          : "bg-[var(--fm-color-garden-cta)] shadow-[0_0_0_2px_rgba(21,128,61,0.25)]"
                      }`}
                    />
                    <article className="rounded-xl border border-[var(--fm-border)] bg-[#faf7f2] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{step.title}</p>
                        <p className="inline-flex items-center gap-1 text-xs text-[var(--fm-text-muted)]">
                          <MdCalendarMonth size={15} />
                          {step.timestamp}
                        </p>
                      </div>
                      {step.detail ? (
                        <p className="mt-2 text-sm text-[var(--fm-text-muted)]">{step.detail}</p>
                      ) : null}
                    </article>
                  </li>
                ))}
              </ol>

              {activeOrder.resolution ? (
                <div className="rounded-xl border border-[#b94a48]/35 bg-[#fff4f3] p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b2f2d]">
                    <MdWarningAmber size={18} />
                    Exception details
                  </p>
                  <p className="mt-1 text-sm text-[#8b2f2d]">{activeOrder.resolution}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="fm-btn fm-btn-secondary px-4 py-2 text-sm">
                      Update address
                    </button>
                    <button
                      type="button"
                      className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--fm-text)]"
                    >
                      Contact support
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[rgba(21,128,61,0.28)] bg-[rgba(21,128,61,0.08)] p-4 text-sm text-[var(--fm-color-forest)]">
                  <p className="inline-flex items-center gap-2 font-semibold">
                    <MdCheckCircle size={18} />
                    Shipment is progressing normally
                  </p>
                  <p className="mt-1 text-[var(--fm-text-muted)]">
                    You&apos;ll keep seeing timestamped updates until delivery is completed.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-[var(--fm-border)] bg-[#faf7f2] p-4 text-sm text-[var(--fm-text-muted)]">
              Enter a valid order ID and email above to load shipment events.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/shop" className="fm-btn fm-btn-secondary">
            Back to shop
          </Link>
          <Link href="/cart" className="fm-btn fm-btn-primary">
            Go to checkout
          </Link>
          <p className="inline-flex items-center gap-2 rounded-xl border border-[var(--fm-border)] px-3 py-2 text-sm text-[var(--fm-text-muted)]">
            <MdLocalShipping size={18} />
            Need guest support? Use your order ID from the confirmation email.
          </p>
        </div>
      </section>
    </div>
  );
}
