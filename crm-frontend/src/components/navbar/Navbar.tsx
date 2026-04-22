import { Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { FileText, Menu } from "lucide-react";
import ProfileMenubar from "./NavMenu";
import NewEmailButton from "./NewEmailButton";
import OrganizationSwitcher from "../OrganizationSwitcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const marketingLinks = [
  { label: "Features", href: "/#features" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Insights", href: "/#insights" },
  { label: "Plans", href: "/#pricing" },
];

const Navbar = ({ isAppRoute = true }: { isAppRoute?: boolean }) => {
  const user = useSelector((state: any) => state.user);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const isAuthenticated = !!user?.isAuthenticated;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-50 w-full border-b backdrop-blur-xl",
        isAuthenticated
          ? "border-slate-200 bg-white/90 text-slate-900"
          : "border-slate-200 bg-background/80 text-slate-900 supports-[backdrop-filter]:bg-background/70"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <FileText className="h-4 w-4" />
            </div>
          ) : (
            <>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold tracking-tight">Favelast</div>
                <div className="text-xs text-muted-foreground">Business workflow platform</div>
              </div>
            </>
          )}
        </Link>

        {/* Center: org switcher (authenticated) or nav links (marketing) */}
        {isAuthenticated ? (
          <div className="hidden items-center gap-3 lg:flex">
            <OrganizationSwitcher
              value={selectedOrgId}
              onChange={(org: any) =>
                setSelectedOrgId(org?.id || org?._id || null)
              }
            />
          </div>
        ) : (
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {marketingLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden md:block">
                <NewEmailButton />
              </div>
              <ProfileMenubar user={user} />
            </>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Button asChild variant="ghost" className="rounded-2xl text-sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-2xl text-sm">
                <Link to="/signup">Get started</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <div className={cn(isAuthenticated ? "lg:hidden" : "sm:hidden")}>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[280px]">
                {isAuthenticated ? (
                  <div className="mt-6 space-y-4">
                    <OrganizationSwitcher
                      value={selectedOrgId}
                      onChange={(org: any) =>
                        setSelectedOrgId(org?.id || org?._id || null)
                      }
                    />
                    <div className="pt-2">
                      <NewEmailButton />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    <div className="flex flex-col gap-1">
                      {marketingLinks.map((item) => (
                        <a key={item.label} href={item.href}>
                          <Button variant="ghost" className="w-full justify-start rounded-xl">
                            {item.label}
                          </Button>
                        </a>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 border-t pt-4">
                      <Button asChild variant="outline" className="w-full rounded-xl">
                        <Link to="/login">Log in</Link>
                      </Button>
                      <Button asChild className="w-full rounded-xl">
                        <Link to="/signup">Get started</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;