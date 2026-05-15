import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  Wrench,
  LayoutDashboard,
  Settings,
  Package,
  CalendarCheck,
  ShoppingBag,
  Star,
  MessageCircle,
  User,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { logout } from "@/features/auth/authSlice";
import api from "@/utils/axios";

const serviceNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/service-dashboard" },
  { label: "My Centre", icon: Settings, path: "/service-dashboard/centre" },
  { label: "Services", icon: Wrench, path: "/service-dashboard/services" },
  { label: "Products", icon: Package, path: "/service-dashboard/products" },
  {
    label: "Bookings",
    icon: CalendarCheck,
    path: "/service-dashboard/bookings",
  },
  { label: "Messages", icon: MessageCircle, path: "/chats" },
  { label: "Profile", icon: User, path: "/profile" },
  { label: "Orders", icon: ShoppingBag, path: "/service-dashboard/orders" },
  { label: "Reviews", icon: Star, path: "/service-dashboard/reviews" },
];

const adminNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Users", icon: Settings, path: "/admin/users" },
  { label: "Service Centres", icon: Wrench, path: "/admin/service-centres" },
  { label: "Services", icon: Wrench, path: "/admin/services" },
  { label: "Products", icon: Package, path: "/admin/products" },
  { label: "Bookings", icon: CalendarCheck, path: "/admin/bookings" },
  { label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
  { label: "Reviews", icon: Star, path: "/admin/reviews" },
];

const DashboardLayout = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = isAdmin ? adminNavItems : serviceNavItems;
  const homeTarget = isAdmin ? "/admin" : "/service-dashboard";

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    dispatch(logout());
    toast.success("Logged out");
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link to={homeTarget} className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-indigo-600">RPAR</span>
        </Link>
      </div>

      <Separator />

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-indigo-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
              {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom Actions */}
      <div className="p-4 space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* ─── Desktop Sidebar ──────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-background shrink-0">
        <SidebarContent />
      </aside>

      {/* ─── Mobile Sidebar ───────────────────────────── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-background border-r z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ─── Main Content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur h-16 flex items-center justify-between px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden lg:block">
            <h1 className="text-sm font-medium text-muted-foreground">
              {navItems.find((n) => n.path === location.pathname)?.label ||
                "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(homeTarget)}
            >
              <Wrench className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
