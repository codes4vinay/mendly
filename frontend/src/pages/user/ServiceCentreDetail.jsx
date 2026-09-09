import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  Phone,
  Star,
  Wrench,
  ArrowLeft,
  Package,
  MessageCircle,
} from "lucide-react";
import { getOrCreateChat } from "@/features/chat/chatSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/shared/Layout";
import api from "@/utils/axios";
import { formatPrice } from "@/utils/helpers";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ServiceCentreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [centre, setCentre] = useState(null);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    fetchCentre();
  }, [id]);

  const fetchCentre = async () => {
    try {
      const [centreRes, servicesRes, productsRes] = await Promise.all([
        api.get(`/service-centres/${id}`),
        api.get(`/services?serviceCentre=${id}`),
        api.get(`/products?serviceCentre=${id}`),
      ]);
      setCentre(centreRes.data.data.serviceCentre);
      setServices(servicesRes.data.data.services);
      setProducts(productsRes.data.data.products);
    } catch (error) {
      toast.error("Centre not found");
      navigate("/service-centres");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageOwner = async () => {
    try {
      setCreatingChat(true);
      const chat = await dispatch(getOrCreateChat(centre._id)).unwrap();
      toast.success("Chat opened");
      navigate(`/chat/${chat._id}`);
    } catch (error) {
      toast.error(error || "Failed to open chat");
    } finally {
      setCreatingChat(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton height={260} className="rounded-2xl mb-6" />
          <Skeleton count={5} />
        </div>
      </Layout>
    );
  }

  if (!centre) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-10">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 overflow-hidden shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {centre.photos?.[0] ? (
                  <img
                    src={centre.photos[0]}
                    alt={centre.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Wrench className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight break-words">
                  {centre.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm sm:text-base">
                      {centre.rating?.average || 0}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      ({centre.rating?.count || 0})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <Button
                onClick={handleMessageOwner}
                disabled={creatingChat}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-10 sm:h-11 px-5 shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2.5 sm:gap-4 mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-900/60">
            {centre.address?.city && (
              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-indigo-500" />
                <span className="leading-snug">
                  {centre.address.street && `${centre.address.street}, `}
                  {centre.address.city}
                </span>
              </div>
            )}
            {centre.phone && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-indigo-500" />
                <span>{centre.phone}</span>
              </div>
            )}
            {centre.workingHours && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 text-indigo-500" />
                <span>
                  {centre.workingHours.open} - {centre.workingHours.close}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="services">
          <TabsList className="mb-6 w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
            <TabsTrigger value="services">
              Services ({services.length})
            </TabsTrigger>
            <TabsTrigger value="products">
              Products ({products.length})
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            {services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {services.map((service) => (
                  <Card
                    key={service._id}
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => navigate(`/services/${service._id}`)}
                  >
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="text-xs mb-2">
                        {service.category?.replace(/_/g, " ")}
                      </Badge>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-indigo-600">
                          {formatPrice(service.price)}
                        </span>
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No services available</p>
              </div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <Card
                    key={product._id}
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => navigate(`/marketplace/${product._id}`)}
                  >
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="text-xs mb-2">
                        {product.condition}
                      </Badge>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-green-600">
                          {formatPrice(product.price)}
                        </span>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No products available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ServiceCentreDetail;
