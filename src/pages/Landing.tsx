import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Upload, Layout, Share2, Check } from "lucide-react";

const Landing = () => {
  const scrollToHowItWorks = () => {
    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Seu catálogo digital <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                pronto em minutos
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Crie catálogos e cardápios online com fotos, preços e coleções. 
              Tudo em um link — perfeito para WhatsApp e Instagram.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/criar-conta">
                <Button size="lg" className="w-full sm:w-auto">
                  Começar grátis
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto"
              >
                Ver como funciona
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Sem taxa sobre vendas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Mobile-first</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Como funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Cadastre seus produtos</h3>
              <p className="text-muted-foreground">
                Adicione fotos, descrições e preços dos seus produtos
              </p>
            </div>

            <div className="text-center group animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Layout className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Monte seu catálogo</h3>
              <p className="text-muted-foreground">
                Organize por coleções e tags do jeito que você quiser
              </p>
            </div>

            <div className="text-center group animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Compartilhe o link</h3>
              <p className="text-muted-foreground">
                Use no WhatsApp, Instagram e onde você quiser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valor */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card rounded-3xl shadow-medium p-8 sm:p-12 text-center border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Mais bonito que PDF, mais simples que loja virtual
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Atualize a qualquer momento. O link reflete tudo na hora.
            </p>
            <Link to="/criar-conta">
              <Button size="lg">Começar agora</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Cardapli
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/entrar" className="hover:text-foreground transition-colors">
                Entrar
              </Link>
              <Link to="/criar-conta" className="hover:text-foreground transition-colors">
                Criar conta
              </Link>
              <a href="#" className="hover:text-foreground transition-colors">
                Termos
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
