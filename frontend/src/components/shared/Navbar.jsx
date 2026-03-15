import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Wrench,
  Moon,
  Sun,
  Menu,
  X,
  Bell,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { logout } from "@/features/auth/authSlice";
import { fetchNotifications } from "@/features/notification/notificationSlice";
import api from "@/utils/axios";

const Navbar = () => {
  const { user, isAuthenticated, isService, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { unreadCount } = useSelector((state) => state.notification);

  // Fetch notifications on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ page: 1, limit: 20 }));
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // logout anyway even if API fails
    }
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const homeTarget = isService
    ? "/service-dashboard"
    : isAdmin
      ? "/admin"
      : "/";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={homeTarget} className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-indigo-600">Mendly</span>
          </Link>

          {/* Desktop Nav Links */}
          {!isService && !isAdmin && (
            <div className="hidden md:flex items-center gap-6">
            <Link
              to="/services"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link
              to="/service-centres"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Centres
            </Link>
            <Link
              to="/marketplace"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Marketplace
            </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/notifications")}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center bg-indigo-600">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>

                {/* Cart — only for users */}
                {!isService && !isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/cart")}
                    className="relative"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                )}

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium">
                        {user?.name}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {/* Dashboard link based on role */}
                    {isService && (
                      <DropdownMenuItem
                        onClick={() => navigate("/service-dashboard")}
                      >
                        Dashboard
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    {!isService && !isAdmin && (
                      <>
                        <DropdownMenuItem
                          onClick={() => navigate("/my-bookings")}
                        >
                          My Bookings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate("/my-orders")}
                        >
                          My Orders
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="h-4 w-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-500 focus:text-red-500"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && !isService && !isAdmin && (
          <div className="md:hidden py-4 border-t space-y-2">
            <Link
              to="/services"
              className="block px-4 py-2 text-sm hover:bg-accent rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/service-centres"
              className="block px-4 py-2 text-sm hover:bg-accent rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Centres
            </Link>
            <Link
              to="/marketplace"
              className="block px-4 py-2 text-sm hover:bg-accent rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Marketplace
            </Link>
            {!isAuthenticated && (
              <div className="flex gap-2 px-4 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => {
                    navigate("/register");
                    setMenuOpen(false);
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
