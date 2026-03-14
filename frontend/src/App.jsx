import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "./routes/ProtectedRoute";
import useTheme from "./hooks/useTheme";

// auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// user pages
import Home from "./pages/user/Home";
import Services from "./pages/user/Services";
import ServiceDetail from "./pages/user/ServiceDetail";
import Marketplace from "./pages/user/Marketplace";
import ProductDetail from "./pages/user/ProductDetail";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import MyBookings from "./pages/user/MyBookings";
import MyOrders from "./pages/user/MyOrders";
import Profile from "./pages/user/Profile";
import Notifications from "./pages/user/Notifications";
import ServiceCentres from "./pages/user/ServiceCentres";
import ServiceCentreDetail from "./pages/user/ServiceCentreDetail";

// service pages
import ServiceDashboard from "./pages/service/Dashboard";
import ManageCentre from "./pages/service/ManageCentre";
import ManageServices from "./pages/service/ManageServices";
import ManageProducts from "./pages/service/ManageProducts";
import CentreBookings from "./pages/service/CentreBookings";
import CentreOrders from "./pages/service/CentreOrders";
import CentreReviews from "./pages/service/CentreReviews";

// admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminServiceCentres from "./pages/admin/ServiceCentres";
import AdminBookings from "./pages/admin/Bookings";
import AdminOrders from "./pages/admin/Orders";
import AdminReviews from "./pages/admin/Reviews";

// shared
import NotFound from "./pages/NotFound";

const App = () => {
  useTheme(); // initializes dark mode

  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:id" element={<ServiceDetail />} />
      <Route path="/service-centres" element={<ServiceCentres />} />
      <Route path="/service-centres/:id" element={<ServiceCentreDetail />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/marketplace/:id" element={<ProductDetail />} />

      {/* user protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={["user"]} />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* service centre protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={["service"]} />}>
          <Route path="/service-dashboard" element={<ServiceDashboard />} />
          <Route path="/service-dashboard/centre" element={<ManageCentre />} />
          <Route
            path="/service-dashboard/services"
            element={<ManageServices />}
          />
          <Route
            path="/service-dashboard/products"
            element={<ManageProducts />}
          />
          <Route
            path="/service-dashboard/bookings"
            element={<CentreBookings />}
          />
          <Route path="/service-dashboard/orders" element={<CentreOrders />} />
          <Route
            path="/service-dashboard/reviews"
            element={<CentreReviews />}
          />
        </Route>
      </Route>

      {/* admin protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route
            path="/admin/service-centres"
            element={<AdminServiceCentres />}
          />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
