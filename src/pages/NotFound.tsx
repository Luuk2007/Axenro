
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glassy-card rounded-xl p-8 max-w-md w-full text-center space-y-6 animate-fade-in subtle-shadow">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
