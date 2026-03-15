import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, MapPin, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/shared/Layout";
import api from "@/utils/axios";
import { formatPrice, formatDateTime, getStatusColor } from "@/utils/helpers";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [status, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      params.append("page", page);
      params.append("limit", 10);
      const res = await api.get(`/orders/my?${params}`);
      setOrders(res.data.data.orders);
      setTotalPages(res.data.data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/orders/${id}/status`, {
        status: "cancelled",
        cancellationReason: "Cancelled by customer",
      });
      toast.success("Order cancelled");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground mt-1">
              Track your marketplace orders
            </p>
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton count={4} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                            <Package className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">
                                Order #{order._id.slice(-8).toUpperCase()}
                              </h3>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                              <Badge
                                className={getStatusColor(
                                  order.payment?.status,
                                )}
                              >
                                {order.payment?.status}
                              </Badge>
                            </div>

                            {/* Items */}
                            <div className="mt-2 space-y-1">
                              {order.items?.map((item, i) => (
                                <p
                                  key={i}
                                  className="text-sm text-muted-foreground"
                                >
                                  {item.product?.name} × {item.quantity} —{" "}
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-3 mt-2">
                              {order.serviceCentre && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{order.serviceCentre.name}</span>
                                </div>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {formatDateTime(order.createdAt)}
                              </p>
                            </div>

                            {order.cancellationReason && (
                              <p className="text-sm text-red-500 mt-1">
                                Reason: {order.cancellationReason}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <span className="font-bold text-green-600 text-lg">
                            {formatPrice(order.totalAmount)}
                          </span>
                          <div className="flex gap-2">
                            {["pending", "confirmed"].includes(
                              order.status,
                            ) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancel(order._id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse our marketplace to place an order
            </p>
            <Button
              onClick={() => navigate("/marketplace")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Browse Marketplace
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrders;
