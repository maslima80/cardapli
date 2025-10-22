import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, FolderTree, Tag } from "lucide-react";

export default function CompartilharPurpose() {
  const navigate = useNavigate();

  const purposes = [
    {
      id: "few-products",
      icon: Package,
      title: "Poucos produtos",
      description: "Quero mostrar só alguns produtos específicos.",
      color: "from-blue-500 to-cyan-500",
      route: "/compartilhar/produtos",
    },
    {
      id: "categories",
      icon: FolderTree,
      title: "Organizar por categorias",
      description: "Quero criar um catálogo dividido por categorias.",
      color: "from-purple-500 to-pink-500",
      route: "/compartilhar/categorias",
    },
    {
      id: "tags",
      icon: Tag,
      title: "Organizar por tags",
      description: "Quero criar um catálogo dividido por temas ou tags.",
      color: "from-orange-500 to-red-500",
      route: "/compartilhar/tags",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/catalogos")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Como você quer montar seu catálogo hoje?</h1>
            <p className="text-muted-foreground mt-1">
              Escolha a melhor forma de organizar seus produtos
            </p>
          </div>
        </div>

        {/* Purpose Cards */}
        <div className="grid gap-4">
          {purposes.map((purpose) => {
            const Icon = purpose.icon;
            return (
              <button
                key={purpose.id}
                onClick={() => navigate(purpose.route)}
                className="group relative bg-card border-2 border-border hover:border-primary rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${purpose.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {purpose.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {purpose.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Dica:</strong> Não se preocupe! Você sempre pode editar e adicionar mais seções depois de criar o catálogo.
          </p>
        </div>
      </div>
    </div>
  );
}
