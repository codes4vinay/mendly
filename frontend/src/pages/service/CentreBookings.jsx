import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck, Loader2, MapPin, MessageCircle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { getOrCreateChat } from "@/features/chat/chatSlice";
import api from "@/utils/axios";
import { formatPrice, formatDateTime, getStatusColor } from "@/utils/helpers";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CentreBookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [centreId, setCentreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [updating, setUpdating] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updateDialog, setUpdateDialog] = useState(null);
  const [trackingMessage, setTrackingMessage] = useState("");
  const [chatOpeningFor, setChatOpeningFor] = useState(null);

  useEffect(() => {
    fetchCentreAndBookings();
  }, []);
  useEffect(() => {
    if (centreId) fetchBookings();
  }, [status, page, centreId]);

  const fetchCentreAndBookings = async () => {
    try {
      const res = await api.get("/service-centres/my/centre");
      setCentreId(res.data.data.serviceCentre._id);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      params.append("page", page);
      params.append("limit", 10);
      const res = await api.get(`/bookings/centre/${centreId}?${params}`);
      setBookings(res.data.data.bookings);
      setTotalPages(res.data.data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const updateTracking = async (bookingId, trackStatus) => {
    setUpdating(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/status`, {
        trackingStatus: trackStatus,
        trackingMessage: trackingMessage || trackStatus.replace(/_/g, " "),
      });
      toast.success("Tracking updated");
      setUpdateDialog(null);
      setTrackingMessage("");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const getNextActions = (status) => {
    const actions = {
      pending: [
        { label: "Confirm", status: "confirmed", color: "bg-blue-600" },
        { label: "Cancel", status: "cancelled", color: "bg-red-600" },
      ],
      confirmed: [
        { label: "Start", status: "in_progress", color: "bg-purple-600" },
        { label: "Cancel", status: "cancelled", color: "bg-red-600" },
      ],
      in_progress: [
        { label: "Complete", status: "completed", color: "bg-green-600" },
      ],
    };
    return actions[status] || [];
  };

  const handleMessageCustomer = async (booking) => {
    if (!booking?.serviceCentre) {
      toast.error("Service centre not found for this booking");
      return;
    }

    try {
      setChatOpeningFor(booking._id);
      const serviceCentreId =
        typeof booking.serviceCentre === "string"
          ? booking.serviceCentre
          : booking.serviceCentre._id;

      const chat = await dispatch(getOrCreateChat(serviceCentreId)).unwrap();
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bookings</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer repair bookings
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton count={3} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <>
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold">
                              {booking.service?.name}
                            </h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status?.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Customer:{" "}
                            <span className="font-medium text-foreground">
                              {booking.customer?.name}
                            </span>
                            {" · "}
                            {booking.customer?.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Scheduled: {formatDateTime(booking.scheduledAt)}
                          </p>

                          {/* Device Details */}
                          {booking.deviceDetails?.issue && (
                            <div className="text-sm bg-slate-50 dark:bg-slate-900 p-2 rounded mt-2 mb-2">
                              <p className="text-muted-foreground">
                                Device: {booking.deviceDetails.brand}{" "}
                                {booking.deviceDetails.model}
                              </p>
                              <p className="text-muted-foreground">
                                Issue: {booking.deviceDetails.issue}
                              </p>
                              {booking.devicePhotos?.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {booking.devicePhotos.map((photo) => (
                                    <img
                                      key={photo}
                                      src={photo}
                                      alt="Device"
                                      className="h-20 w-full rounded-md object-cover border"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pickup Address */}
                          {booking.pickupAddress?.city && (
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                              <div>
                                <p>
                                  {booking.pickupAddress.street &&
                                    `${booking.pickupAddress.street}, `}
                                  {booking.pickupAddress.city}{" "}
                                  {booking.pickupAddress.pincode}
                                </p>
                                {booking.pickupContact && (
                                  <p>Contact: {booking.pickupContact}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-bold text-lg text-indigo-600">
                            {formatPrice(booking.totalAmount)}
                          </span>
                          <div className="flex gap-2 flex-wrap justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={chatOpeningFor === booking._id}
                              onClick={() => handleMessageCustomer(booking)}
                            >
                              {chatOpeningFor === booking._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <MessageCircle className="h-3.5 w-3.5" />
                              )}
                              Message Customer
                            </Button>
                            {getNextActions(booking.status).map((action) => (
                              <Button
                                key={action.status}
                                size="sm"
                                disabled={updating === booking._id}
                                onClick={() =>
                                  updateStatus(booking._id, action.status)
                                }
                                className={`${action.color} hover:opacity-90 text-white`}
                              >
                                {updating === booking._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  action.label
                                )}
                              </Button>
                            ))}
                            {booking.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setUpdateDialog(booking._id)}
                              >
                                Update Tracking
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tracking Timeline */}
                      {booking.tracking?.timeline &&
                        booking.tracking.timeline.length > 0 && (
                          <div className="border-t pt-2">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                              Tracking
                            </p>
                            <div className="space-y-1">
                              {booking.tracking.timeline
                                .slice(-3)
                                .map((entry, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1 shrink-0" />
                                    <div>
                                      <p className="font-medium">
                                        {entry.status?.replace(/_/g, " ")}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        {entry.message}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
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
            <CalendarCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">
              Bookings will appear here when customers book your services
            </p>
          </div>
        )}

        {/* Update Tracking Dialog */}
        {updateDialog && (
          <Dialog
            open={!!updateDialog}
            onOpenChange={() => setUpdateDialog(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Tracking Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Select
                  disabled={updating}
                  onValueChange={(value) => {
                    updateTracking(updateDialog, value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tracking status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup_scheduled">
                      Pickup Scheduled
                    </SelectItem>
                    <SelectItem value="device_picked_up">
                      Device Picked Up
                    </SelectItem>
                    <SelectItem value="under_repair">Under Repair</SelectItem>
                    <SelectItem value="repair_done">Repair Done</SelectItem>
                    <SelectItem value="out_for_delivery">
                      Out for Delivery
                    </SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CentreBookings;
