import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Wrench,
  Star,
  Loader2,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import Layout from "@/components/shared/Layout";
import api from "@/utils/axios";
import { formatPrice, formatDateTime, getStatusColor } from "@/utils/helpers";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewedIds, setReviewedIds] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, [status, page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      params.append("page", page);
      params.append("limit", 10);
      const res = await api.get(`/bookings/my?${params}`);
      setBookings(res.data.data.bookings);
      setTotalPages(res.data.data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/bookings/${id}/status`, {
        status: "cancelled",
        cancellationReason: "Cancelled by customer",
      });
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    }
  };

  const handleReviewSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        rating,
        comment,
        service: reviewBooking.service?._id,
        booking: reviewBooking._id,
      });
      toast.success("Review submitted!");
      setReviewedIds((prev) => [...prev, reviewBooking._id]);
      setReviewBooking(null);
      setRating(5);
      setComment("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground mt-1">
              Track your repair bookings
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
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
        ) : bookings.length > 0 ? (
          <>
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                            <Wrench className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">
                                {booking.service?.name}
                              </h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status?.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2">
                              {booking.serviceCentre && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{booking.serviceCentre.name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {formatDateTime(booking.scheduledAt)}
                                </span>
                              </div>
                              {booking.completedAt && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Completed:{" "}
                                    {formatDateTime(booking.completedAt)}
                                  </span>
                                </div>
                              )}
                            </div>
                            {booking.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Note: {booking.notes}
                              </p>
                            )}
                            {booking.cancellationReason && (
                              <p className="text-sm text-red-500 mt-1">
                                Reason: {booking.cancellationReason}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <span className="font-bold text-indigo-600 text-lg">
                            {formatPrice(booking.totalAmount)}
                          </span>
                          <div className="flex gap-2 flex-wrap justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/services/${booking.service?._id}`)
                              }
                              className="gap-1"
                            >
                              View <ArrowRight className="h-3 w-3" />
                            </Button>
                            {["pending", "confirmed"].includes(
                              booking.status,
                            ) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancel(booking._id)}
                              >
                                Cancel
                              </Button>
                            )}
                            {booking.status === "completed" &&
                              !reviewedIds.includes(booking._id) && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setReviewBooking(booking);
                                    setRating(5);
                                    setComment("");
                                  }}
                                  className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                                >
                                  <Star className="h-3 w-3" /> Review
                                </Button>
                              )}
                            {reviewedIds.includes(booking._id) && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                Reviewed ✓
                              </Badge>
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
            <Wrench className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-4">
              Book a repair service to get started
            </p>
            <Button
              onClick={() => navigate("/services")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Browse Services
            </Button>
          </div>
        )}
      </div>

      {/* ─── Review Dialog ──────────────────────────────── */}
      <Dialog
        open={!!reviewBooking}
        onOpenChange={() => setReviewBooking(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Service:{" "}
                <span className="font-medium text-foreground">
                  {reviewBooking?.service?.name}
                </span>
              </p>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label>
                Comment{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setReviewBooking(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewSubmit}
                disabled={submitting}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MyBookings;
