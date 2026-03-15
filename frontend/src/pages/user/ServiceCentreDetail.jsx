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
        <div className="max-w-7xl mx-auto px-4 py-10">
          <Skeleton height={300} className="rounded-2xl mb-6" />
          <Skeleton count={5} />
        </div>
      </Layout>
    );
  }

  if (!centre) return null;

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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-2xl p-8 mb-8 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
              {centre.photos?.[0] ? (
                <img
                  src={centre.photos[0]}
                  alt={centre.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Wrench className="h-10 w-10 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{centre.name}</h1>
              <div className="flex flex-wrap gap-4 mt-3">
                {centre.address?.city && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {centre.address.street && `${centre.address.street}, `}
                      {centre.address.city}
                    </span>
                  </div>
                )}
                {centre.phone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{centre.phone}</span>
                  </div>
                )}
                {centre.workingHours && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {centre.workingHours.open} - {centre.workingHours.close}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-xl">
                  {centre.rating?.average || 0}
                </span>
                <span className="text-muted-foreground text-sm">
                  ({centre.rating?.count || 0})
                </span>
              </div>
              <Button
                onClick={handleMessageOwner}
                disabled={creatingChat}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="services">
          <TabsList className="mb-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
