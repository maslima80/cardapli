import { Link } from "react-router-dom";
import { Button } from "./ui/button";

interface NavbarProps {
  showAuthButtons?: boolean;
}

export const Navbar = ({ showAuthButtons = true }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Cardapli
            </span>
          </Link>

          {showAuthButtons && (
            <div className="flex items-center gap-3">
              <Link to="/entrar">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/criar-conta">
                <Button size="sm">Criar conta</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
