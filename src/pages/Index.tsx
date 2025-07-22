import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard on app load
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-pulse">
          <h1 className="text-2xl font-bold gradient-hero bg-clip-text text-transparent">
            PowerGen PPM
          </h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
