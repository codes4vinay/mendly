import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/shared/DashboardLayout";
import api from "@/utils/axios";
import { formatDate } from "@/utils/helpers";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AdminServiceCentres = () => {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchCentres();
  }, [page]);

  const fetchCentres = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/service-centres?page=${page}&limit=10`);
      setCentres(res.data.data.serviceCentres);
      setTotalPages(res.data.data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    setToggling(id);
    try {
      const res = await api.put(`/admin/service-centres/${id}/toggle`);
      toast.success(res.data.message);
      fetchCentres();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setToggling(null);
    }
  };

  const filteredCentres = centres.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Service Centres</h1>
          <p className="text-muted-foreground mt-1">
            Manage all service centres
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search centres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-md"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton height={50} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCentres.map((centre, index) => (
              <motion.div
                key={centre._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                          <span className="font-medium text-blue-600">
                            {centre.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{centre.name}</p>
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              ★ {centre.rating?.average || 0}
                            </Badge>
                          </div>
                          {centre.address?.city && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{centre.address.city}</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Owner: {centre.owner?.name} •{" "}
                            {formatDate(centre.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1">
                          {centre.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={`text-sm ${centre.isActive ? "text-green-600" : "text-red-500"}`}
                          >
                            {centre.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={centre.isActive ? "destructive" : "default"}
                          disabled={toggling === centre._id}
                          onClick={() => toggleStatus(centre._id)}
                          className={
                            !centre.isActive
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : ""
                          }
                        >
                          {toggling === centre._id
                            ? "..."
                            : centre.isActive
                              ? "Suspend"
                              : "Activate"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
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
      </div>
    </DashboardLayout>
  );
};

export default AdminServiceCentres;
