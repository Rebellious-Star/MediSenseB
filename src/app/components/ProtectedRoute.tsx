import { Navigate } from "react-router";
import { getStoredUser } from "../api/auth";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("ProtectedRoute: Component mounted, checking user...");
    console.log("ProtectedRoute: localStorage contents:", {
      token: localStorage.getItem("medisense_token"),
      user: localStorage.getItem("medisense_user")
    });
    
    const storedUser = getStoredUser();
    console.log("ProtectedRoute: Retrieved user:", storedUser);
    setUser(storedUser);
    setIsLoading(false);
  }, []);
  
  console.log("ProtectedRoute: Render - User:", user, "Loading:", isLoading);
  
  if (isLoading) {
    console.log("ProtectedRoute: Showing loading state");
    return <div>Loading...</div>;
  }
  
  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("ProtectedRoute: User authenticated, showing protected content");
  return <>{children}</>;
}
