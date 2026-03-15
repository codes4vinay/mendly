import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Wrench,
  CalendarCheck,
  ShoppingBag,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/shared/DashboardLayout";
import api from "@/utils/axios";
import { formatPrice, formatDateTime, getStatusColor } from "@/utils/helpers";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const StatCard = ({ title, value, icon: Icon, color, subtitle, loading }) => (
  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
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
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
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
  </motion.div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, bookingsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users?limit=5"),
        api.get("/admin/bookings?limit=5"),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
      setBookings(bookingsRes.data.data.bookings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and management
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            color="bg-indigo-100 dark:bg-indigo-950 text-indigo-600"
            loading={loading}
          />
          <StatCard
            title="Service Centres"
            value={stats?.totalCentres || 0}
            icon={Wrench}
            color="bg-blue-100 dark:bg-blue-950 text-blue-600"
            loading={loading}
          />
          <StatCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            icon={CalendarCheck}
            color="bg-green-100 dark:bg-green-950 text-green-600"
            loading={loading}
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingBag}
            color="bg-purple-100 dark:bg-purple-950 text-purple-600"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Users</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/users")}
                className="text-indigo-600"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton count={5} />
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-xs font-medium text-indigo-600">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{user.role}</Badge>
                        {user.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/bookings")}
                className="text-indigo-600"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton count={5} />
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
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
                          {formatDateTime(booking.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
