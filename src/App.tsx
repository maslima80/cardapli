import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import CriarConta from "./pages/CriarConta";
import Entrar from "./pages/Entrar";
import Recuperar from "./pages/Recuperar";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Produtos from "./pages/Produtos";
import Catalogos from "./pages/Catalogos";
import CatalogoEditor from "./pages/CatalogoEditor";
import PublicCatalog from "./pages/PublicCatalog";
import PublicCatalogPage from "./pages/PublicCatalogPage";
import EscolherSlug from "./pages/EscolherSlug";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/criar-conta" element={<CriarConta />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/recuperar" element={<Recuperar />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/catalogos" element={<Catalogos />} />
          <Route path="/catalogos/:id/editor" element={<CatalogoEditor />} />
          <Route path="/c/:slug" element={<PublicCatalogPage />} />
          <Route path="/@:slug/:catalog_slug" element={<PublicCatalog />} />
          <Route path="/escolher-slug" element={<EscolherSlug />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
