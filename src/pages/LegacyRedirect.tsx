import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * Legacy redirect component
 * Redirects old /@user/catalog URLs to new /u/user/catalog format
 */
const LegacyRedirect = () => {
  const { userSlug, catalogSlug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (userSlug) {
      const newPath = catalogSlug 
        ? `/u/${userSlug}/${catalogSlug}`
        : `/u/${userSlug}`;
      
      // Redirect to new URL format
      navigate(newPath, { replace: true });
    }
  }, [userSlug, catalogSlug, navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
};

export default LegacyRedirect;
