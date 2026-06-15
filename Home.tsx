import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h1
          className="text-6xl md:text-7xl font-bold mb-8"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          Plataforma de Pedidos
        </h1>
        <div className="w-24 h-px bg-foreground/20 mx-auto mb-12"></div>
        
        <Button
          onClick={() => navigate("/order-portal")}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-12 py-8 text-lg font-semibold inline-flex items-center gap-3"
        >
          Crear Pedido
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
