import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/shared/DashboardLayout";
import api from "@/utils/axios";
import { formatDate } from "@/utils/helpers";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reviews?page=${page}&limit=10`);
      setReviews(res.data.data.reviews);
      setTotalPages(res.data.data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id) => {
    setToggling(id);
    try {
      const res = await api.put(`/admin/reviews/${id}/toggle`);
      toast.success(res.data.message);
      fetchReviews();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setToggling(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage all platform reviews
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton count={2} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="space-y-3">
              {reviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className={!review.isVisible ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <span className="text-xs font-medium text-indigo-600">
                                  {review.customer?.name
                                    ?.charAt(0)
                                    .toUpperCase()}
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
                                  className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            {!review.isVisible && (
                              <Badge variant="destructive" className="text-xs">
                                Hidden
                              </Badge>
                            )}
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {review.comment}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {review.service && (
                              <Badge variant="secondary" className="text-xs">
                                Service: {review.service?.name}
                              </Badge>
                            )}
                            {review.product && (
                              <Badge variant="secondary" className="text-xs">
                                Product: {review.product?.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={toggling === review._id}
                          onClick={() => toggleVisibility(review._id)}
                          className="gap-1 shrink-0"
                        >
                          {review.isVisible ? (
                            <>
                              <EyeOff className="h-3 w-3" /> Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" /> Show
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
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
          </>
        ) : (
          <div className="text-center py-20">
            <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No reviews found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminReviews;
