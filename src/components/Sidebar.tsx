import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Users,
  UserCircle,
  ShoppingCart,
  Home,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapseChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    onCollapseChange?.(collapsed);
  }, [collapsed, onCollapseChange]);

  const isPathActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const links = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/customers", icon: Users, label: "Customers" },
    { to: "/employees", icon: UserCircle, label: "Employees" },
    { to: "/products", icon: Package, label: "Products" },
    { to: "/orders", icon: ShoppingCart, label: "Orders" },
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen select-none",
        "bg-white dark:bg-gray-900",
        "border-r border-border/50",
        "shadow-[0_0_30px_rgba(0,0,0,0.03)]",
        "transition-[width] duration-300 ease-spring",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <header className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          {!collapsed && (
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
              Next-Gen
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "h-8 w-8 p-0",
              "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950",
              "rounded-full",
              "transition-all duration-200",
              !collapsed && "ml-auto"
            )}
          >
            <div
              className={cn(
                "transition-transform duration-200",
                collapsed ? "rotate-0" : "rotate-180"
              )}
            >
              <ChevronLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </Button>
        </header>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {links.map(({ to, icon: Icon, label }) => {
              const isActive = isPathActive(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      "flex items-center gap-x-3",
                      "h-10 relative rounded-lg",
                      "text-[15px] font-medium",
                      collapsed ? "justify-center px-2" : "px-3",
                      "transition-colors duration-100",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 "
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-bg"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-100/80 via-indigo-100/80 to-purple-50/80 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20"
                        transition={{
                          type: "spring",
                          duration: 0.1,
                          bounce: 0.15,
                        }}
                      />
                    )}

                    <div className="relative z-10">
                      <Icon className="h-[18px] w-[18px]" />
                    </div>

                    {!collapsed && (
                      <span className="relative z-10 transition-colors duration-200">
                        {label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <footer className="p-2 border-t border-border/50 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              "w-full h-10 relative rounded-lg",
              collapsed ? "justify-center px-2" : "px-3 justify-start",
              "gap-x-3",
              "text-[15px] font-medium",
              "text-gray-600 dark:text-gray-400",
              "hover:text-blue-600 dark:hover:text-blue-400",
              "transition-colors duration-200"
            )}
          >
            <div className="relative z-10">
              <LogOut className="h-[18px] w-[18px]" />
            </div>

            {!collapsed && <span className="relative z-10">Logout</span>}
          </Button>
        </footer>
      </div>
    </aside>
  );
}
