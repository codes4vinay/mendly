import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Star,
  MapPin,
  Phone,
  ArrowLeft,
  ShoppingCart,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/shared/Layout";
import api from "@/utils/axios";
import { formatPrice, formatDate } from "@/utils/helpers";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    setSelectedPhoto(0);
  }, [product?._id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data.product);
    } catch (error) {
      toast.error("Product not found");
      navigate("/marketplace");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data.data.reviews);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOrder = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to order");
      navigate("/login");
      return;
    }
    if (!isUser) {
      toast.error("Only users can place orders");
      return;
    }

    setOrdering(true);
    navigate("/checkout", {
      state: {
        buyNowItems: [
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity,
            serviceCentreId: product.serviceCentre?._id,
            serviceCentreName: product.serviceCentre?.name,
          },
        ],
      },
    });
    setOrdering(false);
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("mendly_cart") || "[]");
    const existingIndex = cart.findIndex(
      (item) => item.productId === product._id,
    );
    let nextCart;
    if (existingIndex >= 0) {
      nextCart = [...cart];
      nextCart[existingIndex].quantity += quantity;
    } else {
      nextCart = [
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
          serviceCentreId: product.serviceCentre?._id,
          serviceCentreName: product.serviceCentre?.name,
        },
      ];
    }
    localStorage.setItem("mendly_cart", JSON.stringify(nextCart));
    toast.success("Added to cart");
    navigate("/cart");
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

  if (!product) return null;

  const photos = product.photos?.filter(Boolean) || [];
  const activePhoto = photos[selectedPhoto] || photos[0] || null;

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
          {/* ─── Left: Product Info ─────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/60 sm:min-h-[360px] lg:min-h-[420px]"
              >
                {activePhoto ? (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_45%)] dark:bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),_transparent_45%)]" />
                    <img
                      src={activePhoto}
                      alt={product.name}
                      className="relative z-10 max-h-[390px] w-full object-contain p-4 sm:max-h-[440px] sm:p-6"
                    />
                    {photos.length > 1 && (
                      <div className="absolute bottom-4 right-4 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        {selectedPhoto + 1} / {photos.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                      <Package className="h-10 w-10 text-emerald-500" />
                    </div>
                    <p className="text-sm">Product image will appear here</p>
                  </div>
                )}
              </motion.div>

              {photos.length > 1 && (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {photos.map((photo, index) => (
                    <button
                      key={`${photo}-${index}`}
                      type="button"
                      onClick={() => setSelectedPhoto(index)}
                      className={`overflow-hidden rounded-2xl border bg-slate-50 transition-all dark:bg-slate-950 ${
                        selectedPhoto === index
                          ? "border-emerald-500 ring-2 ring-emerald-500/20"
                          : "border-border/60 hover:border-emerald-300"
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`${product.name} view ${index + 1}`}
                        className="h-20 w-full object-cover sm:h-24"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
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
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">per unit</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(product.rating?.average || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating?.average || 0} ({product.rating?.count || 0}{" "}
                  reviews)
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span
                  className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </span>
              </div>
            </div>

            <Separator />

            {product.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  About this product
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {product.serviceCentre && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Sold by</h2>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg">
                      {product.serviceCentre.name}
                    </h3>
                    {product.serviceCentre.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>
                          {product.serviceCentre.address.street &&
                            `${product.serviceCentre.address.street}, `}
                          {product.serviceCentre.address.city}
                        </span>
                      </div>
                    )}
                    {product.serviceCentre.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{product.serviceCentre.phone}</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/service-centres/${product.serviceCentre._id}`,
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
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <span className="text-xs font-medium text-green-600">
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

          {/* ─── Right: Order Card ──────────────────────── */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Order this product</h2>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price per unit</span>
                  <span className="font-bold text-green-600 text-xl">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <Separator />

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-xl text-green-600">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleOrder}
                    disabled={ordering || product.stock === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {ordering ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Placing order...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Order Now
                      </>
                    )}
                  </Button>
                </div>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground">
                    Please{" "}
                    <span
                      className="text-indigo-600 cursor-pointer hover:underline"
                      onClick={() => navigate("/login")}
                    >
                      login
                    </span>{" "}
                    to order
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

export default ProductDetail;
