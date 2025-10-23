import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { LogOut, Layout, Package, UserCircle } from "lucide-react";
import { OnboardingProgress, OnboardingHints, ConfettiCelebration } from "@/components/onboarding";
import { OnboardingWelcomeWithSlug } from "@/components/onboarding/OnboardingWelcomeWithSlug";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [showWelcomeWithSlug, setShowWelcomeWithSlug] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(true);
  
  // Get onboarding progress
  const { progress } = useOnboardingProgress(user?.id || null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/entrar");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/entrar");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check if user has a slug, show welcome modal if not
  useEffect(() => {
    if (!user) {
      setCheckingSlug(false);
      return;
    }

    const checkSlug = async () => {
      console.log('[Dashboard] Checking slug for user:', user.id);
      
      try {
        // Fetch profile data including slug and business name
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('slug, business_name')
          .eq('id', user.id)
          .single();

        console.log('[Dashboard] Profile data:', profile);

        if (error) {
          console.error('[Dashboard] Error checking profile:', error);
        }

        // If no slug, show welcome modal with slug selection
        if (!profile || !profile.slug) {
          console.log('[Dashboard] NO SLUG - Showing welcome modal');
          setShowWelcomeWithSlug(true);
          setCheckingSlug(false);
          return;
        }

        // Has slug - set it and business name
        console.log('[Dashboard] Has slug:', profile.slug);
        setUserSlug(profile.slug);
        setBusinessName(profile.business_name);
        setCheckingSlug(false);
      } catch (err) {
        console.error('[Dashboard] Exception in checkSlug:', err);
        setCheckingSlug(false);
      }
    };

    checkSlug();
  }, [user]);

  // Handle slug completion
  const handleSlugComplete = (slug: string) => {
    console.log('[Dashboard] Slug completed:', slug);
    setUserSlug(slug);
    setShowWelcomeWithSlug(false);
    toast.success('Bem-vindo ao Cardapli! 🎉');
  };

  // Check if user just completed onboarding (show celebration)
  useEffect(() => {
    const checkCompletion = async () => {
      if (!user || !progress) return;
      
      const hasSeenCelebration = localStorage.getItem(`celebration_shown_${user.id}`);
      if (!hasSeenCelebration && progress.isComplete) {
        setShowCelebration(true);
        localStorage.setItem(`celebration_shown_${user.id}`, 'true');
      }
    };
    
    checkCompletion();
  }, [user, progress]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Você saiu da sua conta");
      navigate("/");
    }
  };

  if (loading || checkingSlug) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const displayName = businessName || userSlug || user?.email?.split("@")[0] || "você";

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Cardapli
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <UserCircle className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Bem-vindo(a), {displayName} 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Crie e gerencie seus catálogos digitais
            </p>
          </div>

          {/* Onboarding Progress */}
          <div className="mb-8">
            {user && <OnboardingProgress userId={user.id} />}
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Criar Catálogo */}
            <div className="bg-card rounded-3xl shadow-medium p-6 border border-border hover:shadow-glow transition-all duration-300 group animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Layout className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Criar Catálogo</h3>
              <p className="text-muted-foreground mb-4">
                Monte um catálogo lindo com seus produtos.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/catalogos")}>
                Começar
              </Button>
            </div>

            {/* Gerenciar Produtos */}
            <div className="bg-card rounded-3xl shadow-medium p-6 border border-border hover:shadow-glow transition-all duration-300 group animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gerenciar Produtos</h3>
              <p className="text-muted-foreground mb-4">
                Adicione, edite e organize sua biblioteca de produtos.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/produtos")}>
                Ver Produtos
              </Button>
            </div>

            {/* Perfil & Design */}
            <div className="bg-card rounded-3xl shadow-medium p-6 border border-border hover:shadow-glow transition-all duration-300 group animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <UserCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Perfil & Design</h3>
              <p className="text-muted-foreground mb-4">
                Logo, contatos, redes sociais, cores e fonte.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/perfil")}>
                Editar Perfil
              </Button>
            </div>
          </div>

        </div>
      </main>

      {/* Onboarding Hints */}
      {user && progress && <OnboardingHints userId={user.id} progress={progress} />}

      {/* Welcome Modal with Slug Selection */}
      {user && (
        <OnboardingWelcomeWithSlug
          open={showWelcomeWithSlug}
          onComplete={handleSlugComplete}
          userId={user.id}
        />
      )}

      {/* Celebration Modal */}
      <ConfettiCelebration
        open={showCelebration}
        onOpenChange={setShowCelebration}
      />
    </div>
  );
};

export default Dashboard;
