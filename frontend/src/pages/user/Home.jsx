import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wrench,
  Smartphone,
  Laptop,
  Tv,
  Gamepad2,
  Star,
  ArrowRight,
  ShieldCheck,
  Clock,
  ThumbsUp,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/shared/Layout";
import api from "@/utils/axios";
import { formatPrice } from "@/utils/helpers";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ─── Data ──────────────────────────────────────────────────────
const categories = [
  {
    label: "Mobile Repair",
    icon: Smartphone,
    value: "mobile_repair",
    color: "bg-blue-100 dark:bg-blue-950   text-blue-600",
  },
  {
    label: "Laptop Repair",
    icon: Laptop,
    value: "laptop_repair",
    color: "bg-purple-100 dark:bg-purple-950 text-purple-600",
  },
  {
    label: "TV Repair",
    icon: Tv,
    value: "tv_repair",
    color: "bg-green-100 dark:bg-green-950  text-green-600",
  },
  {
    label: "Gaming Console",
    icon: Gamepad2,
    value: "gaming_console_repair",
    color: "bg-orange-100 dark:bg-orange-950 text-orange-600",
  },
  {
    label: "Appliance Repair",
    icon: Wrench,
    value: "appliance_repair",
    color: "bg-red-100 dark:bg-red-950     text-red-600",
  },
];

const steps = [
  {
    icon: ShieldCheck,
    title: "Choose a service",
    desc: "Browse repair services or products from verified centres near you.",
  },
  {
    icon: Clock,
    title: "Book appointment",
    desc: "Pick a date and time that works for you. Instant confirmation.",
  },
  {
    icon: ThumbsUp,
    title: "Get it fixed",
    desc: "Expert technicians fix your device. Pay only when satisfied.",
  },
];

// ─── Components ────────────────────────────────────────────────
const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
        onClick={() => navigate(`/services/${service._id}`)}
      >
        <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center">
          <Wrench className="h-12 w-12 text-indigo-400" />
        </div>
        <CardContent className="p-4">
          <Badge variant="secondary" className="text-xs mb-2">
            {service.category?.replace(/_/g, " ")}
          </Badge>
          <h3 className="font-semibold text-sm line-clamp-1">{service.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {service.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-indigo-600">
              {formatPrice(service.price)}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">{service.rating?.average || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
        onClick={() => navigate(`/marketplace/${product._id}`)}
      >
        <div className="h-40 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-950 dark:to-teal-950 flex items-center justify-center">
          <Smartphone className="h-12 w-12 text-green-400" />
        </div>
        <CardContent className="p-4">
          <Badge variant="secondary" className="text-xs mb-2">
            {product.condition}
          </Badge>
          <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              Stock: {product.stock}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingSvc, setLoadingSvc] = useState(true);
  const [loadingPrd, setLoadingPrd] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/services?limit=4");
        setServices(res.data.data.services);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSvc(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await api.get("/products?limit=4");
        setProducts(res.data.data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPrd(false);
      }
    };

    fetchServices();
    fetchProducts();
  }, []);

  return (
    <Layout>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-background to-purple-50 dark:from-indigo-950/30 dark:via-background dark:to-purple-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100">
              Trusted by 10,000+ customers
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Fix your devices with{" "}
              <span className="text-indigo-600">trusted experts</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book repair services for all your electronics or shop quality
              parts and devices from verified service centres near you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/services")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
              >
                Book a Repair <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/marketplace")}
                className="px-8"
              >
                Shop Marketplace
              </Button>
            </div>
          </motion.div>
        </div>

        {/* decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-200 dark:bg-indigo-900 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full translate-x-1/2 translate-y-1/2 opacity-20 blur-3xl" />
      </section>

      {/* ─── Categories ───────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">What do you need fixed?</h2>
          <p className="text-muted-foreground mt-2">
            Choose a category to find the right service
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/services?category=${cat.value}`)}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-md transition-all text-center p-6">
                <div
                  className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center mx-auto mb-3`}
                >
                  <cat.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">{cat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">How Mendly works</h2>
            <p className="text-muted-foreground mt-2">
              Get your device fixed in 3 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center mx-auto -mt-2 mb-4">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Services ────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Featured Services</h2>
            <p className="text-muted-foreground mt-1">
              Top rated repair services near you
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/services")}
            className="text-indigo-600"
          >
            View all <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {loadingSvc ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton height={160} />
                <CardContent className="p-4">
                  <Skeleton count={3} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No services available yet</p>
          </div>
        )}
      </section>

      {/* ─── Marketplace Preview ──────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Marketplace</h2>
              <p className="text-muted-foreground mt-1">
                Buy quality electronics and spare parts
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/marketplace")}
              className="text-indigo-600"
            >
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {loadingPrd ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton height={160} />
                  <CardContent className="p-4">
                    <Skeleton count={3} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No products available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Own a repair business?</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Join Mendly as a service centre and reach thousands of customers
            looking for expert repairs.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-8"
          >
            Register your centre <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Home;
