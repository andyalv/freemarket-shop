import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "What's fresh", href: "/fresh" },
  { label: "Shop", href: "/shop" },
  { label: "Tracking", href: "/tracking" },
];

export function StorefrontNavbar() {
  return (
    <header className="fm-site-header">
      <div className="fm-container flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-3 text-base font-bold tracking-[0.2px]">
          <Image
            src="/logo.png"
            alt="FreeMarket logo"
            width={70}
            height={70}
            className="rounded-[8px]"
            priority
          />
          FreeMarket
        </Link>

        <nav className="flex items-center gap-4 text-sm sm:gap-5 sm:text-base">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="fm-nav-link">
              {item.label}
            </Link>
          ))}
          <Link href="/signin" className="fm-btn fm-btn-secondary px-4 py-2 text-sm">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
