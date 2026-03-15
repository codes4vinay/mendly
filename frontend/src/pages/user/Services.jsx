import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Star, Wrench, X } from "lucide-react";
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
  { label: "Mobile Repair", value: "mobile_repair" },
  { label: "Laptop Repair", value: "laptop_repair" },
  { label: "TV Repair", value: "tv_repair" },
  { label: "Gaming Console", value: "gaming_console_repair" },
  { label: "Appliance Repair", value: "appliance_repair" },
  { label: "Tablet Repair", value: "tablet_repair" },
  { label: "Smartwatch Repair", value: "smartwatch_repair" },
  { label: "Printer Repair", value: "printer_repair" },
  { label: "Other", value: "other_electronics" },
];

const Services = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchServices();
  }, [category, sortBy, page]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.append("category", category);
      params.append("page", page);
      params.append("limit", 9);

      const res = await api.get(`/services?${params}`);
      setServices(res.data.data.services);
      setTotalPages(res.data.data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setPage(1);
    setSearchParams(val !== "all" ? { category: val } : {});
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ─── Header ──────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Repair Services</h1>
          <p className="text-muted-foreground mt-1">
            Find expert repair services near you
          </p>
        </div>

        {/* ─── Filters ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </form>

          {/* Category */}
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {category !== "all" && (
            <Button
              variant="outline"
              onClick={() => handleCategoryChange("all")}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {/* ─── Active filter badge ──────────────────────── */}
        {category !== "all" && (
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="gap-1">
              {CATEGORIES.find((c) => c.value === category)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleCategoryChange("all")}
              />
            </Badge>
          </div>
        )}

        {/* ─── Services Grid ────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton height={160} />
                <CardContent className="p-4">
                  <Skeleton count={3} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all overflow-hidden h-full"
                    onClick={() => navigate(`/services/${service._id}`)}
                  >
                    <div className="h-44 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center">
                      <Wrench className="h-14 w-14 text-indigo-300" />
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="text-xs mb-2">
                        {service.category?.replace(/_/g, " ")}
                      </Badge>
                      <h3 className="font-semibold line-clamp-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {service.description || "Professional repair service"}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-bold text-indigo-600 text-lg">
                          {formatPrice(service.price)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {service.rating?.average || 0} (
                            {service.rating?.count || 0})
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {service.serviceCentre?.name}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
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
            <Wrench className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground mb-4">
              Try changing your filters
            </p>
            <Button
              onClick={() => handleCategoryChange("all")}
              variant="outline"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Services;
