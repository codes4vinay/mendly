import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="bg-indigo-100 dark:bg-indigo-900 p-6 rounded-full">
        <Wrench className="h-12 w-12 text-indigo-600" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-indigo-600">404</h1>
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
        <Button
          onClick={() => navigate("/")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
