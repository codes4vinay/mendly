import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/shared/DashboardLayout";
import api from "@/utils/axios";
import { formatDate } from "@/utils/helpers";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ReviewCard = ({ review }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <span className="text-xs font-medium text-indigo-600">
              {review.customer?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">{review.customer?.name}</p>
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
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground mt-3">{review.comment}</p>
      )}
      {review.service && (
        <Badge variant="secondary" className="text-xs mt-2">
          {review.service?.name}
        </Badge>
      )}
      {review.product && (
        <Badge variant="secondary" className="text-xs mt-2">
          {review.product?.name}
        </Badge>
      )}
    </CardContent>
  </Card>
);

const CentreReviews = () => {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const servicesRes = await api.get("/services/my/services");
      const serviceList = servicesRes.data.data.services;
      setServices(serviceList);

      // fetch reviews for all services
      const reviewPromises = serviceList.map((s) =>
        api.get(`/reviews/service/${s._id}`).then((r) => r.data.data.reviews),
      );
      const allReviews = (await Promise.all(reviewPromises)).flat();
      setReviews(allReviews);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1,
      )
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground mt-1">
            See what customers say about your services
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-yellow-500">{avgRating}</p>
              <div className="flex justify-center gap-1 my-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold">{reviews.length}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Total Reviews
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold">
                {reviews.filter((r) => r.rating >= 4).length}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Positive Reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton count={2} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground">
              Reviews will appear here when customers rate your services
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CentreReviews;
