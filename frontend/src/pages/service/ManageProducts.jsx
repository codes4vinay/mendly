import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
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
import { uploadImages } from "@/utils/uploads";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CATEGORIES = [
  "mobile",
  "laptop",
  "tv",
  "gaming_console",
  "appliance",
  "tablet",
  "smartwatch",
  "accessories",
  "spare_parts",
  "other",
];

const CONDITIONS = ["new", "like_new", "good", "fair"];

const productSchema = z.object({
  name: z.string().min(3, "Name too short"),
  description: z.string().optional(),
  category: z.enum(CATEGORIES),
  condition: z.enum(CONDITIONS),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
});

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { category: "mobile", condition: "new", stock: 1 },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/my/products");
      setProducts(res.data.data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    reset({ category: "mobile", condition: "new", stock: 1 });
    setExistingPhotos([]);
    setNewPhotos([]);
    setOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    reset(product);
    setExistingPhotos(product.photos || []);
    setNewPhotos([]);
    setOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const uploadedPhotos = await uploadImages(newPhotos, "mendly/products");
      const payload = {
        ...data,
        photos: [...existingPhotos, ...uploadedPhotos],
      };

      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
        toast.success("Product updated!");
      } else {
        await api.post("/products", payload);
        toast.success("Product created!");
      }
      setOpen(false);
      setExistingPhotos([]);
      setNewPhotos([]);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const removeNewPhoto = (targetPhoto) => {
    setNewPhotos((prev) => prev.filter((photo) => photo !== targetPhoto));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your marketplace products
            </p>
          </div>
          <Button
            onClick={openAdd}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" /> Add Product
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
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow overflow-hidden">
                    <div className="h-40 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                      {product.photos?.[0] ? (
                        <img
                          src={product.photos[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-muted-foreground opacity-40" />
                      )}
                    </div>
                    <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category?.replace(/_/g, " ")}
                      </Badge>
                      <Badge
                        className={
                          product.condition === "new"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }
                      >
                        {product.condition?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {product.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(product)}
                        className="flex-1 gap-1"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product._id)}
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
        ) : (
          <div className="text-center py-20">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">Add your first product</p>
            <Button
              onClick={openAdd}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                {...register("name")}
                placeholder="iPhone 13 Screen"
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
                placeholder="Describe your product..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={watch("category")}
                  onValueChange={(v) => setValue("category", v)}
                >
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={watch("condition")}
                  onValueChange={(v) => setValue("condition", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  {...register("price")}
                  type="number"
                  placeholder="2500"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-xs text-red-500">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  {...register("stock")}
                  type="number"
                  placeholder="10"
                  className={errors.stock ? "border-red-500" : ""}
                />
                {errors.stock && (
                  <p className="text-xs text-red-500">{errors.stock.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product Images</Label>
              <p className="text-xs text-muted-foreground">
                You can upload multiple product photos. The first one becomes
                the main image on product cards.
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewPhotos(Array.from(e.target.files || []))}
              />
              <p className="text-xs text-muted-foreground">
                Hold `Ctrl` or `Shift` while picking files to select more than
                one image at once.
              </p>
              {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {existingPhotos.map((photo) => (
                    <div key={photo} className="relative">
                      <img
                        src={photo}
                        alt="Product"
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
                        alt="New product"
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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

export default ManageProducts;
