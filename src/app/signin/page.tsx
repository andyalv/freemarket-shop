"use client";

import Link from "next/link";
import { useEffect, useState, useRef, type FormEvent } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdArrowBack, MdHome, MdPersonAdd } from "react-icons/md";

export default function SignInPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number>(0);
  const signInRef = useRef<HTMLElement | null>(null);
  const signUpRef = useRef<HTMLElement | null>(null);
  const handleNoopSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    const updateHeight = () => {
      const activePanel = isSignUp ? signUpRef.current : signInRef.current;
      if (activePanel) {
        setPanelHeight(activePanel.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isSignUp]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--fm-gradient-hero)" }}
    >
      <section className="fm-container flex flex-col items-center py-10 sm:py-14">
        <div className="max-w-3xl text-center">
          <Link
            href="/"
            aria-label="Go to home page"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--fm-text)] transition hover:bg-[var(--fm-color-tan)] hover:text-white"
          >
            <MdHome className="text-[20px]" aria-hidden="true" />
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]">
            Account
          </p>
          <h1
            className="mt-2 text-4xl leading-tight sm:text-5xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Welcome back to FreeMarket
          </h1>
        </div>

        <div className="mt-10 w-full max-w-xl overflow-hidden rounded-[14px] border border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
          <div
            className="overflow-hidden transition-[height] duration-500 ease-in-out"
            style={{ height: panelHeight > 0 ? `${panelHeight}px` : "auto" }}
          >
            <div
              className={`flex w-[200%] transition-transform duration-500 ease-in-out ${
                isSignUp ? "-translate-x-1/2" : "translate-x-0"
              } items-start`}
            >
              <article ref={signInRef} className="w-1/2 p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-[var(--fm-text)]">Sign in</h2>
                </div>
                <p className="mt-1 text-sm text-[var(--fm-text-muted)]">
                  Access your account, order history, and delivery updates.
                </p>

                <form className="mt-5 space-y-4" onSubmit={handleNoopSubmit}>
                  <label
                    className="block text-sm font-medium text-[var(--fm-text)]"
                    htmlFor="signin-email"
                  >
                    Email
                  </label>
                  <input
                    id="signin-email"
                    name="signin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[var(--fm-border)] bg-white px-4 py-3 text-sm text-[var(--fm-text)] outline-none transition focus:border-[var(--fm-color-tan)]"
                  />

                  <label
                    className="block text-sm font-medium text-[var(--fm-text)]"
                    htmlFor="signin-password"
                  >
                    Password
                  </label>
                  <input
                    id="signin-password"
                    name="signin-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[var(--fm-border)] bg-white px-4 py-3 text-sm text-[var(--fm-text)] outline-none transition focus:border-[var(--fm-color-tan)]"
                  />

                  <button type="submit" className="fm-btn fm-btn-primary w-full">
                    Sign in
                  </button>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[var(--fm-border)]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]">
                    Or
                  </span>
                  <div className="h-px flex-1 bg-[var(--fm-border)]" />
                </div>

                <button type="button" className="fm-btn fm-btn-secondary w-full">
                  <FcGoogle className="text-lg" aria-hidden="true" />
                  <span>Continue with Google</span>
                </button>

                <p className="mt-4 text-sm text-[var(--fm-text-muted)]">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="font-semibold text-[var(--fm-color-clay)] underline-offset-2 hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </article>

              <article ref={signUpRef} className="w-1/2 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--fm-border)] text-[var(--fm-text)] transition hover:bg-[var(--fm-color-tan)] hover:text-white"
                    aria-label="Back to sign in"
                    title="Back to sign in"
                  >
                    <MdArrowBack className="text-[20px]" aria-hidden="true" />
                  </button>
                  <h2 className="text-2xl font-bold text-[var(--fm-text)]">Create account</h2>
                </div>
                <p className="mt-1 text-sm text-[var(--fm-text-muted)]">
                  Save your details, track shipments, and reorder faster.
                </p>

                <form className="mt-5 space-y-4" onSubmit={handleNoopSubmit}>
                  <label
                    className="block text-sm font-medium text-[var(--fm-text)]"
                    htmlFor="signup-name"
                  >
                    Full name
                  </label>
                  <input
                    id="signup-name"
                    name="signup-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-[var(--fm-border)] bg-white px-4 py-3 text-sm text-[var(--fm-text)] outline-none transition focus:border-[var(--fm-color-tan)]"
                  />

                  <label
                    className="block text-sm font-medium text-[var(--fm-text)]"
                    htmlFor="signup-email"
                  >
                    Email
                  </label>
                  <input
                    id="signup-email"
                    name="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[var(--fm-border)] bg-white px-4 py-3 text-sm text-[var(--fm-text)] outline-none transition focus:border-[var(--fm-color-tan)]"
                  />

                  <label
                    className="block text-sm font-medium text-[var(--fm-text)]"
                    htmlFor="signup-password"
                  >
                    Password
                  </label>
                  <input
                    id="signup-password"
                    name="signup-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-[var(--fm-border)] bg-white px-4 py-3 text-sm text-[var(--fm-text)] outline-none transition focus:border-[var(--fm-color-tan)]"
                  />

                  <label
                    className="block text-sm font-medium text-[var(--fm-text)]"
                    htmlFor="signup-confirm-password"
                  >
                    Confirm password
                  </label>
                  <input
                    id="signup-confirm-password"
                    name="signup-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-[var(--fm-border)] bg-white px-4 py-3 text-sm text-[var(--fm-text)] outline-none transition focus:border-[var(--fm-color-tan)]"
                  />

                  <button type="submit" className="fm-btn fm-btn-primary w-full">
                    <MdPersonAdd className="text-lg" aria-hidden="true" />
                    <span>Create account</span>
                  </button>
                </form>

                <p className="mt-4 text-sm text-[var(--fm-text-muted)]">
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="font-semibold text-[var(--fm-color-clay)]">
                    Terms and Privacy Policy
                  </Link>
                  .
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
