"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useTheme } from "@/src/lib/theme-context";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  PackageSearch,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  PawPrint,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "CASHIER"] },
  { label: "Products", href: "/products", icon: Package, roles: ["ADMIN", "CASHIER"] },
  { label: "Customers", href: "/customers", icon: Users, roles: ["ADMIN", "CASHIER"] },
  { label: "Suppliers", href: "/suppliers", icon: Truck, roles: ["ADMIN"] },
  { label: "Sales", href: "/sales", icon: ShoppingCart, roles: ["ADMIN", "CASHIER"] },
  { label: "Stock", href: "/stock", icon: PackageSearch, roles: ["ADMIN"] },
  { label: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/login" });
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-2 px-4 py-5">
        <PawPrint className="h-8 w-8 shrink-0 text-emerald-400" />
        {!collapsed && <span className="text-lg font-bold">PetShop</span>}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-foreground/10 text-sidebar-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-foreground/10 p-2 space-y-1">
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
            "text-sidebar-foreground/60 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
            collapsed && "justify-center"
          )}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {!collapsed && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
        </button>

        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
            "text-sidebar-foreground/60 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
            "text-sidebar-foreground/60 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}