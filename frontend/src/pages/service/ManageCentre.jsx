import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Building2, MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/shared/DashboardLayout";
import api from "@/utils/axios";
import { uploadImages } from "@/utils/uploads";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const centreSchema = z.object({
  name: z.string().min(3, "Name too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Invalid phone"),
  gstin: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }),
  workingHours: z.object({
    open: z.string(),
    close: z.string(),
  }),
});

const ManageCentre = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hascentre, setHasCentre] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(centreSchema),
    defaultValues: {
      workingHours: { open: "09:00", close: "18:00" },
    },
  });

  useEffect(() => {
    fetchCentre();
  }, []);

  const fetchCentre = async () => {
    try {
      const res = await api.get("/service-centres/my/centre");
      reset(res.data.data.serviceCentre);
      setExistingPhotos(res.data.data.serviceCentre.photos || []);
      setHasCentre(true);
    } catch (error) {
      setHasCentre(false);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const uploadedPhotos = await uploadImages(
        newPhotos,
        "rpar/service-centres",
      );
      const payload = {
        ...data,
        photos: [...existingPhotos, ...uploadedPhotos],
      };

      if (hascentre) {
        await api.put("/service-centres/my/centre", payload);
        toast.success("Centre updated successfully!");
      } else {
        await api.post("/service-centres", payload);
        toast.success("Centre created successfully!");
        setHasCentre(true);
      }
      setNewPhotos([]);
      fetchCentre();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const removeNewPhoto = (targetPhoto) => {
    setNewPhotos((prev) => prev.filter((photo) => photo !== targetPhoto));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Skeleton count={10} height={40} className="mb-3" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {hascentre ? "Manage Centre" : "Create Your Centre"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {hascentre
              ? "Update your service centre details"
              : "Set up your service centre to start accepting bookings"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" /> Basic Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Centre Name</Label>
                <Input
                  {...register("name")}
                  placeholder="Tech Repair Hub"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="centre@email.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    {...register("phone")}
                    placeholder="9876543210"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  GSTIN{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input {...register("gstin")} placeholder="22AAAAA0000A1Z5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shop Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Service owners can upload multiple shop photos here. These
                images are used on the public centre page to help customers
                recognize your shop.
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewPhotos(Array.from(e.target.files || []))}
              />
              <p className="text-xs text-muted-foreground">
                Add storefront, reception, workbench, or inside-shop photos.
              </p>
              {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {existingPhotos.map((photo) => (
                    <div key={photo} className="relative">
                      <img
                        src={photo}
                        alt="Centre"
                        className="h-24 w-full rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExistingPhotos((prev) =>
                            prev.filter((item) => item !== photo),
                          )
                        }
                        className="absolute top-1 right-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {newPhotos.map((photo) => (
                    <div
                      key={`${photo.name}-${photo.lastModified}`}
                      className="relative"
                    >
                      <img
                        src={URL.createObjectURL(photo)}
                        alt="New centre"
                        className="h-24 w-full rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewPhoto(photo)}
                        className="absolute top-1 right-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" /> Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street</Label>
                <Input
                  {...register("address.street")}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    {...register("address.city")}
                    placeholder="Delhi"
                    className={errors.address?.city ? "border-red-500" : ""}
                  />
                  {errors.address?.city && (
                    <p className="text-xs text-red-500">
                      {errors.address.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input {...register("address.state")} placeholder="Delhi" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input {...register("address.pincode")} placeholder="110001" />
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" /> Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opening Time</Label>
                  <Input {...register("workingHours.open")} type="time" />
                </div>
                <div className="space-y-2">
                  <Label>Closing Time</Label>
                  <Input {...register("workingHours.close")} type="time" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {hascentre ? "Updating..." : "Creating..."}
              </>
            ) : hascentre ? (
              "Update Centre"
            ) : (
              "Create Centre"
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ManageCentre;
