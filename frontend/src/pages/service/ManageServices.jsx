import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Loader2, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import DashboardLayout from "@/components/shared/DashboardLayout";
import api from "@/utils/axios";
import { formatPrice } from "@/utils/helpers";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CATEGORIES = [
  "mobile_repair",
  "laptop_repair",
  "tv_repair",
  "gaming_console_repair",
  "appliance_repair",
  "tablet_repair",
  "smartwatch_repair",
  "printer_repair",
  "other_electronics",
];

const serviceSchema = z.object({
  name: z.string().min(3, "Name too short"),
  description: z.string().optional(),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().min(0, "Price must be positive"),
  priceType: z.enum(["fixed", "hourly"]),
});

const ManageServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [hasCentre, setHasCentre] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: { priceType: "fixed", category: "mobile_repair" },
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get("/services/my/services");
      setServices(res.data.data.services);
      setHasCentre(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setHasCentre(false);
        return;
      }

      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    if (!hasCentre) {
      toast.info("Create your service centre before adding services.");
      navigate("/service-dashboard/centre");
      return;
    }

    setEditing(null);
    reset({ priceType: "fixed", category: "mobile_repair" });
    setOpen(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    reset(service);
    setOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/services/${editing._id}`, data);
        toast.success("Service updated!");
      } else {
        await api.post("/services", data);
        toast.success("Service created!");
      }
      setOpen(false);
      fetchServices();
    } catch (error) {
      if (error.response?.status === 404) {
        setHasCentre(false);
        setOpen(false);
        toast.info("Create your service centre before adding services.");
        navigate("/service-dashboard/centre");
        return;
      }

      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success("Service deleted");
      fetchServices();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Services</h1>
            <p className="text-muted-foreground mt-1">
              Manage your repair services
            </p>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" /> Add Service
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton count={3} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="text-xs mb-2">
                          {service.category?.replace(/_/g, " ")}
                        </Badge>
                        <h3 className="font-semibold truncate">
                          {service.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {service.description || "No description"}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-indigo-600">
                            {formatPrice(service.price)}
                          </span>
                          <Badge
                            variant={
                              service.isActive ? "default" : "destructive"
                            }
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(service)}
                        className="flex-1 gap-1"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(service._id)}
                        className="gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : !hasCentre ? (
          <div className="text-center py-20">
            <Wrench className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">
              Create your service centre first
            </h3>
            <p className="text-muted-foreground mb-4">
              You need a service centre before you can add repair services.
            </p>
            <Button
              onClick={() => navigate("/service-dashboard/centre")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Go to Centre Setup
            </Button>
          </div>
        ) : (
          <div className="text-center py-20">
            <Wrench className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No services yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first repair service
            </p>
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" /> Add Service
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Service" : "Add Service"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                {...register("name")}
                placeholder="Mobile Screen Repair"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                {...register("description")}
                placeholder="Describe your service..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={watch("category")}
                onValueChange={(v) => setValue("category", v)}
              >
                <SelectTrigger
                  className={errors.category ? "border-red-500" : ""}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  {...register("price")}
                  type="number"
                  placeholder="500"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-xs text-red-500">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Price Type</Label>
                <Select
                  value={watch("priceType")}
                  onValueChange={(v) => setValue("priceType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editing ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManageServices;
