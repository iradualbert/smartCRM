import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Menu, Sparkles } from "lucide-react";
import HeaderLogo from "../HeaderLogo";
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

type NavbarProps = {
  isAppRoute?: boolean;
};

const marketingLinks = [
  { label: "Features", href: "/#features" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Customers", href: "/#customers" },
  { label: "Resources", href: "/#resources" },
];

const Navbar = ({ isAppRoute = true }: NavbarProps) => {
  const location = useLocation();
  const user = useSelector((state: any) => state.user);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const isAuthenticated = !!user?.isAuthenticated;
  const isMarketing = !isAuthenticated && !isAppRoute;

  const navWrapperClass = useMemo(
    () =>
      cn(
        "fixed top-0 right-0 z-50 w-full border-b backdrop-blur-xl",
        isMarketing
          ? "border-white/10 bg-slate-950/75 text-white"
          : "border-slate-200 bg-white/90 text-slate-900"
      ),
    [isMarketing]
  );

  return (
    <header className={navWrapperClass}>
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <HeaderLogo />

          {isAuthenticated ? (
            <div className="hidden items-center gap-3 lg:flex">
              <OrganizationSwitcher
                value={selectedOrgId}
                onChange={(org: any) =>
                  setSelectedOrgId(org?.id || org?._id || null)
                }
              />

              <nav className="ml-2 flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    location.pathname.startsWith("/dashboard")
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  Dashboard
                </Link>

                <Link
                  to="/emails"
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    location.pathname.startsWith("/emails")
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  Emails
                </Link>

                <Link
                  to="/analytics"
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    location.pathname.startsWith("/analytics")
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  Analytics
                </Link>
              </nav>
            </div>
          ) : (
            <nav className="hidden items-center gap-1 lg:flex">
              {marketingLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden md:block">
                <NewEmailButton />
              </div>
              <ProfileMenubar user={user} />
            </>
          ) : (
            <>
              <div className="hidden items-center gap-2 lg:flex">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="rounded-xl text-sm font-medium text-white hover:bg-white/10 hover:text-white"
                  >
                    Log In
                  </Button>
                </Link>

                <Link to="/signup">
                  <Button className="rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                    Start Free
                  </Button>
                </Link>
              </div>

              <div className="hidden md:block lg:hidden">
                <Link to="/signup">
                  <Button className="rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                    Start Free
                  </Button>
                </Link>
              </div>
            </>
          )}

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant={isAuthenticated ? "outline" : "ghost"}
                  size="icon"
                  className={cn(
                    "rounded-xl",
                    !isAuthenticated && "text-white hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[320px]">
                {isAuthenticated ? (
                  <div className="mt-6 space-y-4">
                    <OrganizationSwitcher
                      value={selectedOrgId}
                      onChange={(org: any) =>
                        setSelectedOrgId(org?.id || org?._id || null)
                      }
                    />

                    <div className="flex flex-col gap-2">
                      <Link to="/dashboard">
                        <Button variant="ghost" className="w-full justify-start rounded-xl">
                          Dashboard
                        </Button>
                      </Link>
                      <Link to="/emails">
                        <Button variant="ghost" className="w-full justify-start rounded-xl">
                          Emails
                        </Button>
                      </Link>
                      <Link to="/analytics">
                        <Button variant="ghost" className="w-full justify-start rounded-xl">
                          Analytics
                        </Button>
                      </Link>
                    </div>

                    <div className="pt-2">
                      <NewEmailButton />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <p className="text-sm font-semibold">Launch-ready email ops</p>
                      </div>
                      <p className="text-sm text-slate-600">
                        Schedule campaigns, manage organizations, and track performance from one workspace.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {marketingLinks.map((item) => (
                        <Link key={item.label} to={item.href}>
                          <Button variant="ghost" className="w-full justify-start rounded-xl">
                            {item.label}
                          </Button>
                        </Link>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Link to="/login">
                        <Button variant="outline" className="w-full rounded-xl">
                          Log In
                        </Button>
                      </Link>
                      <Link to="/signup">
                        <Button className="w-full rounded-xl">
                          Start Free
                        </Button>
                      </Link>
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