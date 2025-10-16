import { useLocation, useNavigate } from "react-router-dom";
import { Home, FolderOpen, Package, Zap, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Início", path: "/dashboard" },
  { icon: FolderOpen, label: "Catálogos", path: "/catalogos" },
  { icon: Package, label: "Produtos", path: "/produtos" },
  { icon: Zap, label: "Compartilhar", path: "/compartilhar" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on public routes, editor pages, and auth pages
  const shouldHide = 
    location.pathname.startsWith("/u/") ||
    location.pathname.includes("/editor") ||
    location.pathname.startsWith("/entrar") ||
    location.pathname.startsWith("/cadastro") ||
    location.pathname === "/";

  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon 
                className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
