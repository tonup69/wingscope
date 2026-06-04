import { Link, useLocation } from "wouter";
import { Sun, Moon, FlaskConical, History, BookOpen, Microscope } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Analyze", icon: Microscope },
  { href: "/history", label: "History", icon: History },
  { href: "/reference", label: "Reference", icon: BookOpen },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              aria-label="WingScope logo"
              className="text-primary"
            >
              {/* Wing shape */}
              <path
                d="M14 14 C6 8, 2 18, 7 22 C10 24, 14 20, 14 14Z"
                fill="currentColor"
                opacity="0.85"
              />
              <path
                d="M14 14 C22 8, 26 18, 21 22 C18 24, 14 20, 14 14Z"
                fill="currentColor"
                opacity="0.55"
              />
              {/* Body/thorax dot */}
              <circle cx="14" cy="13" r="2.5" fill="currentColor" />
              {/* Magnifier */}
              <circle cx="22" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.7" />
              <line x1="25" y1="11" x2="27" y2="13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
            </svg>
            <span className="font-bold text-base text-foreground tracking-tight">
              WingScope
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 ml-4" data-testid="main-nav">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid={`nav-${label.toLowerCase()}`}
                  className={cn(
                    "gap-1.5 text-sm font-medium",
                    location === href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={14} />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            data-testid="theme-toggle"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </Button>

          {/* Badge */}
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-full px-2.5 py-0.5">
            <FlaskConical size={10} />
            Research Tool
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>WingScope — AI-powered Drosophila wing phenotype classifier</span>
          <span>Powered by Claude Vision · For research use only</span>
        </div>
      </footer>
    </div>
  );
}
