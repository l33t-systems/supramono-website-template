import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useBrand } from "../hooks/useBrand";

export default function Layout({ children }: { children: ReactNode }) {
  const brand = useBrand();
  const name = brand?.product.name ?? "";

  const nav = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium ${isActive ? "text-brand-primary" : "text-gray-600 hover:text-gray-900"}`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-text">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {brand?.logo_url ? (
              <img src={brand.logo_url} alt={name} className="h-8 w-auto" />
            ) : (
              <span className="text-lg font-bold">{name}</span>
            )}
          </Link>
          <nav className="flex items-center gap-6">
            <NavLink to="/" className={nav} end>Home</NavLink>
            <NavLink to="/blog" className={nav}>Blog</NavLink>
            <NavLink to="/contact" className={nav}>Contact</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8 text-sm text-gray-500 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} {name}</span>
          <span>{brand?.product.tagline}</span>
        </div>
      </footer>
    </div>
  );
}
