import type { ReactNode } from "react";
import { StorefrontNavbar } from "@/components/storefront-navbar";

type StorefrontLayoutProps = {
  children: ReactNode;
};

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StorefrontNavbar />
      <main>{children}</main>
    </div>
  );
}
