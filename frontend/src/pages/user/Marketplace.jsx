import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, Package, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatPrice } from "@/utils/helpers";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Mobile", value: "mobile" },
  { label: "Laptop", value: "laptop" },
  { label: "TV", value: "tv" },
  { label: "Gaming Console", value: "gaming_console" },
  { label: "Appliance", value: "appliance" },
  { label: "Tablet", value: "tablet" },
  { label: "Smartwatch", value: "smartwatch" },
  { label: "Accessories", value: "accessories" },
  { label: "Spare Parts", value: "spare_parts" },
  { label: "Other", value: "other" },
];

const CONDITIONS = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Like New", value: "like_new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
];

const Marketplace = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [category, condition, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.append("category", category);
      if (condition !== "all") params.append("condition", condition);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      params.append("page", page);
      params.append("limit", 9);

      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data.products);
      setTotalPages(res.data.data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const clearFilters = () => {
    setCategory("all");
    setCondition("all");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const hasFilters =
    category !== "all" || condition !== "all" || minPrice || maxPrice;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Buy quality electronics and spare parts
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={condition}
            onValueChange={(v) => {
              setCondition(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            type="number"
            className="w-full md:w-28"
          />
          <Input
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            type="number"
            className="w-full md:w-28"
          />

          <Button
            onClick={fetchProducts}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Search
          </Button>

          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            {category !== "all" && (
              <Badge variant="secondary">
                {CATEGORIES.find((c) => c.value === category)?.label}
              </Badge>
            )}
            {condition !== "all" && (
              <Badge variant="secondary">
                {CONDITIONS.find((c) => c.value === condition)?.label}
              </Badge>
            )}
            {minPrice && <Badge variant="secondary">Min: ₹{minPrice}</Badge>}
            {maxPrice && <Badge variant="secondary">Max: ₹{maxPrice}</Badge>}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton height={180} />
                <CardContent className="p-4">
                  <Skeleton count={3} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => {
                const productPhoto = product.photos?.find(Boolean);

                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-all overflow-hidden h-full"
                      onClick={() => navigate(`/marketplace/${product._id}`)}
                    >
                      <div className="h-44 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-950 dark:to-teal-950 flex items-center justify-center overflow-hidden">
                        {productPhoto ? (
                          <img
                            src={productPhoto}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-14 w-14 text-green-300" />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.category?.replace(/_/g, " ")}
                          </Badge>
                          <Badge
                            className={`text-xs ${
                              product.condition === "new"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}
                          >
                            {product.condition?.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <h3 className="font-semibold line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {product.description || "Quality electronics product"}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="font-bold text-green-600 text-lg">
                            {formatPrice(product.price)}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">
                                {product.rating?.average || 0}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {product.serviceCentre?.name}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
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
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try changing your filters
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Marketplace;
