import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  ShoppingBag,
  Wrench,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { getOrCreateChat } from "@/features/chat/chatSlice";
import api from "@/utils/axios";
import { formatPrice, formatDateTime, getStatusColor } from "@/utils/helpers";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";
import "react-loading-skeleton/dist/skeleton.css";

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton width={80} height={32} className="mt-1" />
          ) : (
            <p className="text-3xl font-bold mt-1">{value}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ServiceDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [centre, setCentre] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpeningFor, setChatOpeningFor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const centreRes = await api.get("/service-centres/my/centre");
      const serviceCentre = centreRes.data.data.serviceCentre;
      setCentre(serviceCentre);

      const [servicesRes, productsRes] = await Promise.all([
        api.get("/services/my/services"),
        api.get("/products/my/products"),
      ]);

      setServices(servicesRes.data.data.services);
      setProducts(productsRes.data.data.products);

      const centreId = serviceCentre._id;
      const [bookingsRes, ordersRes] = await Promise.all([
        api.get(`/bookings/centre/${centreId}?limit=5`),
        api.get(`/orders/centre/${centreId}?limit=5`),
      ]);

      setBookings(bookingsRes.data.data.bookings);
      setOrders(ordersRes.data.data.orders);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.info("Set up your service centre to access the dashboard.");
        navigate("/service-dashboard/centre", { replace: true });
        return;
      }

      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // calculate stats
  const totalRevenue = [
    ...bookings
      .filter((b) => b.status === "completed")
      .map((b) => b.totalAmount),
    ...orders.filter((o) => o.status === "delivered").map((o) => o.totalAmount),
  ].reduce((a, b) => a + b, 0);

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const handleMessageCustomer = async () => {
    if (!centre?._id) {
      toast.error("Service centre is not ready yet");
      return;
    }

    try {
      setChatOpeningFor("dashboard");
      const chat = await dispatch(getOrCreateChat(centre._id)).unwrap();
      navigate(`/chat/${chat._id}`);
    } catch (error) {
      toast.error(error || "Failed to open chat");
    } finally {
      setChatOpeningFor(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {centre?.name || "..."}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your service centre today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatPrice(totalRevenue)}
            icon={TrendingUp}
            color="bg-indigo-100 dark:bg-indigo-950 text-indigo-600"
            loading={loading}
          />
          <StatCard
            title="Total Services"
            value={services.length}
            icon={Wrench}
            color="bg-blue-100 dark:bg-blue-950 text-blue-600"
            loading={loading}
          />
          <StatCard
            title="Total Products"
            value={products.length}
            icon={Package}
            color="bg-green-100 dark:bg-green-950 text-green-600"
            loading={loading}
          />
          <StatCard
            title="Pending Actions"
            value={pendingBookings + pendingOrders}
            icon={Clock}
            color="bg-orange-100 dark:bg-orange-950 text-orange-600"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Add Service",
              path: "/service-dashboard/services",
              icon: Wrench,
              color: "bg-blue-600",
            },
            {
              label: "Add Product",
              path: "/service-dashboard/products",
              icon: Package,
              color: "bg-green-600",
            },
            {
              label: "View Bookings",
              path: "/service-dashboard/bookings",
              icon: CalendarCheck,
              color: "bg-indigo-600",
            },
            {
              label: "View Orders",
              path: "/service-dashboard/orders",
              icon: ShoppingBag,
              color: "bg-purple-600",
            },
            {
              label: "Messages",
              path: "/chats",
              icon: MessageCircle,
              color: "bg-emerald-600",
            },
          ].map((action) => (
            <motion.div
              key={action.path}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => navigate(action.path)}
                className={`w-full h-16 ${action.color} hover:opacity-90 text-white flex-col gap-1`}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/service-dashboard/bookings")}
                className="text-indigo-600"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton count={4} />
              ) : bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking._id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {booking.service?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.customer?.name} •{" "}
                          {formatDateTime(booking.scheduledAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleMessageCustomer}
                          disabled={chatOpeningFor === "dashboard"}
                        >
                          {chatOpeningFor === "dashboard" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <MessageCircle className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <span className="text-sm font-medium">
                          {formatPrice(booking.totalAmount)}
                        </span>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No bookings yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/service-dashboard/orders")}
                className="text-indigo-600"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton count={4} />
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.buyer?.name} •{" "}
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatPrice(order.totalAmount)}
                        </span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No orders yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ServiceDashboard;
