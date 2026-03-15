import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Clock, Star, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/shared/Layout";
import api from "@/utils/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ServiceCentres = () => {
  const navigate = useNavigate();
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCentres();
  }, [page]);

  const fetchCentres = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append("city", city);
      params.append("page", page);
      params.append("limit", 9);
      const res = await api.get(`/service-centres?${params}`);
      setCentres(res.data.data.serviceCentres);
      setTotalPages(res.data.data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCentres = centres.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Service Centres</h1>
          <p className="text-muted-foreground mt-1">
            Find verified repair centres near you
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search centres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pl-9 w-full md:w-48"
            />
          </div>
          <Button
            onClick={fetchCentres}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Search
          </Button>
          {city && (
            <Button
              variant="outline"
              onClick={() => {
                setCity("");
                fetchCentres();
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton count={4} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCentres.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredCentres.map((centre, index) => (
                <motion.div
                  key={centre._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all h-full"
                    onClick={() => navigate(`/service-centres/${centre._id}`)}
                  >
                    <div className="h-36 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-950 dark:to-blue-950 rounded-t-lg flex items-center justify-center overflow-hidden">
                      {centre.photos?.[0] ? (
                        <img
                          src={centre.photos[0]}
                          alt={centre.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Wrench className="h-12 w-12 text-indigo-300" />
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold line-clamp-1">
                        {centre.name}
                      </h3>
                      {centre.address?.city && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{centre.address.city}</span>
                        </div>
                      )}
                      {centre.workingHours && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {centre.workingHours.open} -{" "}
                            {centre.workingHours.close}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">
                            {centre.rating?.average || 0}
                          </span>
                        </div>
                        <Button size="sm" variant="outline">
                          View Centre
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
            <Wrench className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No centres found</h3>
            <p className="text-muted-foreground">Try a different city</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ServiceCentres;
