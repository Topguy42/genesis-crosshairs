import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Target, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gaming-purple to-gaming-blue rounded-full flex items-center justify-center">
            <Target className="w-12 h-12 text-white opacity-50" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-gaming-purple to-gaming-blue bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold">Target Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Looks like this crosshair target is out of range. Let's get you back
            to the action.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-gaming-purple hover:bg-gaming-purple/80"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Crosshairs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Target className="w-4 h-4 mr-2" />
              Browse Gallery
            </Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Attempted to access:{" "}
          <code className="bg-muted px-2 py-1 rounded">
            {location.pathname}
          </code>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
