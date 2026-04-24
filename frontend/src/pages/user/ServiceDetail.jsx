import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wrench,
  Star,
  MapPin,
  Clock,
  Phone,
  ArrowLeft,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/shared/Layout";
import api from "@/utils/axios";
import { formatPrice, formatDate } from "@/utils/helpers";
import { openRazorpayCheckout } from "@/utils/razorpay";
import { uploadImages } from "@/utils/uploads";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isUser, user } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [date, setDate] = useState(null);
  const [pickupAddress, setPickupAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [pickupContact, setPickupContact] = useState("");
  const [deviceDetails, setDeviceDetails] = useState({
    brand: "",
    model: "",
    issue: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [devicePhotos, setDevicePhotos] = useState([]);

  useEffect(() => {
    fetchService();
    fetchReviews();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await api.get(`/services/${id}`);
      setService(res.data.data.service);
    } catch (error) {
      toast.error("Service not found");
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/service/${id}`);
      setReviews(res.data.data.reviews);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to book");
      navigate("/login");
      return;
    }
    if (!isUser) {
      toast.error("Only users can book services");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    if (!pickupContact) {
      toast.error("Please provide contact number");
      return;
    }
    if (!pickupAddress.city || !pickupAddress.pincode) {
      toast.error("Please provide city and pincode");
      return;
    }
    if (!deviceDetails.issue) {
      toast.error("Please describe the device issue");
      return;
    }

    setBooking(true);
    try {
      const uploadedDevicePhotos = await uploadImages(
        devicePhotos,
        "mendly/device-photos",
      );
      const res = await api.post("/bookings", {
        service: service._id,
        serviceCentre: service.serviceCentre._id,
        scheduledAt: date.toISOString(),
        totalAmount: service.price,
        pickupAddress,
        pickupContact,
        deviceDetails,
        devicePhotos: uploadedDevicePhotos,
        paymentMethod,
      });

      const data = res.data.data;
      if (data.paymentRequired) {
        const paymentPayload = await openRazorpayCheckout({
          checkout: data.checkout,
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: pickupContact || user?.phone,
          },
          notes: {
            entityType: "booking",
            entityId: data.booking._id,
          },
        });

        await api.post(`/bookings/${data.booking._id}/verify-payment`, paymentPayload);
      }

      toast.success(
        paymentMethod === "cash"
          ? "Booking created successfully!"
          : "Payment successful and booking created!",
      );
      navigate("/my-bookings");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <Skeleton height={400} className="rounded-2xl mb-6" />
          <Skeleton count={5} />
        </div>
      </Layout>
    );
  }

  if (!service) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Left: Service Info ─────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-64 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-2xl flex items-center justify-center"
            >
              <Wrench className="h-20 w-20 text-indigo-300" />
            </motion.div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {service.category?.replace(/_/g, " ")}
                  </Badge>
                  <h1 className="text-3xl font-bold">{service.name}</h1>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-600">
                    {formatPrice(service.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {service.priceType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(service.rating?.average || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {service.rating?.average || 0} ({service.rating?.count || 0}{" "}
                  reviews)
                </span>
              </div>
            </div>

            <Separator />

            {service.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  About this service
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            )}

            <Separator />

            {service.serviceCentre && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Service Centre</h2>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg">
                      {service.serviceCentre.name}
                    </h3>
                    {service.serviceCentre.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>
                          {service.serviceCentre.address.street &&
                            `${service.serviceCentre.address.street}, `}
                          {service.serviceCentre.address.city}
                        </span>
                      </div>
                    )}
                    {service.serviceCentre.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{service.serviceCentre.phone}</span>
                      </div>
                    )}
                    {service.serviceCentre.workingHours && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>
                          {service.serviceCentre.workingHours.open} -{" "}
                          {service.serviceCentre.workingHours.close}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/service-centres/${service.serviceCentre._id}`,
                        )
                      }
                    >
                      View Centre
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                              <span className="text-xs font-medium text-indigo-600">
                                {review.customer?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {review.customer?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-3">
                            {review.comment}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No reviews yet</p>
              )}
            </div>
          </div>

          {/* ─── Right: Booking Card ────────────────────── */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Book this service</h2>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold text-indigo-600 text-xl">
                    {formatPrice(service.price)}
                  </span>
                </div>
                <Separator />

                {/* Schedule */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Select Date & Time
                  </label>
                  <DatePicker
                    selected={date}
                    onChange={(d) => setDate(d)}
                    showTimeSelect
                    minDate={new Date()}
                    dateFormat="dd MMM yyyy, hh:mm aa"
                    placeholderText="Pick a date & time"
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    wrapperClassName="w-full"
                  />
                </div>

                <Separator />

                {/* Pickup Contact */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Number</label>
                  <input
                    type="tel"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Your phone number"
                    value={pickupContact}
                    onChange={(e) => setPickupContact(e.target.value)}
                  />
                </div>

                {/* Pickup Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pickup Address</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm mb-1"
                    placeholder="Street"
                    value={pickupAddress.street}
                    onChange={(e) =>
                      setPickupAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="text"
                      className="border rounded-md px-3 py-2 text-sm"
                      placeholder="City"
                      value={pickupAddress.city}
                      onChange={(e) =>
                        setPickupAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                    />
                    <input
                      type="text"
                      className="border rounded-md px-3 py-2 text-sm"
                      placeholder="Pincode"
                      value={pickupAddress.pincode}
                      onChange={(e) =>
                        setPickupAddress((prev) => ({
                          ...prev,
                          pincode: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Device Details */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Details</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm mb-1"
                    placeholder="Brand (e.g., Samsung)"
                    value={deviceDetails.brand}
                    onChange={(e) =>
                      setDeviceDetails((prev) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm mb-1"
                    placeholder="Model (e.g., Galaxy S21)"
                    value={deviceDetails.model}
                    onChange={(e) =>
                      setDeviceDetails((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Issue description"
                    value={deviceDetails.issue}
                    onChange={(e) =>
                      setDeviceDetails((prev) => ({
                        ...prev,
                        issue: e.target.value,
                      }))
                    }
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setDevicePhotos(Array.from(e.target.files || []))
                    }
                  />
                  {devicePhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {devicePhotos.map((photo) => (
                        <img
                          key={`${photo.name}-${photo.lastModified}`}
                          src={URL.createObjectURL(photo)}
                          alt="Device"
                          className="h-20 w-full rounded-md object-cover border"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={booking}
                  >
                    <option value="razorpay">Pay Online (Razorpay Test)</option>
                    <option value="cash">Pay at Service Centre</option>
                  </select>
                </div>

                <Separator />

                <Button
                  onClick={handleBooking}
                  disabled={booking}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {booking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {paymentMethod === "cash" ? "Booking..." : "Processing..."}
                    </>
                  ) : (
                    paymentMethod === "cash" ? "Book Now" : "Pay & Book"
                  )}
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground">
                    Please{" "}
                    <span
                      className="text-indigo-600 cursor-pointer hover:underline"
                      onClick={() => navigate("/login")}
                    >
                      login
                    </span>{" "}
                    to book
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServiceDetail;
