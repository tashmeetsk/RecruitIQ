import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading session...</div>;
  if (!user) return null;
  return <Component {...rest} />;
}
