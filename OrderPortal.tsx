import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";

interface Category {
  id: number;
  name: string;
  displayName: string;
  description?: string | null;
  subcategories?: Array<{
    id: number;
    name: string;
    displayName: string;
  }>;
}

export default function OrderPortal() {
  const [, navigate] = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategoriesQuery = trpc.orders.getCategories.useQuery();

  useEffect(() => {
    if (getCategoriesQuery.data) {
      setCategories(getCategoriesQuery.data);
      setLoading(false);
    }
  }, [getCategoriesQuery.data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    // Navegar a formulario sin subcategoría
    navigate(`/order-form/${categoryId}/${encodeURIComponent(categoryName)}`);
  };

  const handleSubcategoryClick = (categoryId: number, categoryName: string, subcategoryId: number, subcategoryName: string) => {
    // Navegar a formulario con subcategoría
    navigate(`/order-form/${categoryId}/${encodeURIComponent(categoryName)}/${subcategoryId}/${encodeURIComponent(subcategoryName)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container py-12 md:py-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-serif-display)" }}>
            Crear Pedido
          </h1>
          <div className="w-16 h-px bg-foreground/20 mb-6"></div>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Selecciona una categoría para comenzar a crear tu pedido. Podrás añadir múltiples productos en una sola solicitud.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container py-16 md:py-24">
        {getCategoriesQuery.error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error al cargar categorías</p>
              <p className="text-sm text-destructive/80">{getCategoriesQuery.error.message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category) => (
            <div key={category.id} className="space-y-4">
              {/* Main category card */}
              <Card
                className="p-8 md:p-10 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 border-border hover:border-foreground/30 rounded-none"
                onClick={() => {
                  // If has subcategories, don't navigate yet
                  if (category.subcategories && category.subcategories.length > 0) {
                    return;
                  }
                  handleCategoryClick(category.id, category.name);
                }}
              >
                <h2 className="text-2xl md:text-3xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif-display)" }}>
                  {category.displayName}
                </h2>
                <div className="w-8 h-px bg-foreground/20 mb-4"></div>
                {category.description && (
                  <p className="text-foreground/60 mb-6 text-sm">{category.description}</p>
                )}

                {/* If no subcategories, show button */}
                {!category.subcategories || category.subcategories.length === 0 ? (
                  <Button
                    onClick={() => handleCategoryClick(category.id, category.name)}
                    className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none"
                  >
                    Crear Pedido
                  </Button>
                ) : (
                  <p className="text-xs text-foreground/50 uppercase tracking-widest">
                    Selecciona una subcategoría
                  </p>
                )}
              </Card>

              {/* Subcategories */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="space-y-3 pl-4 border-l-2 border-foreground/20">
                  {category.subcategories.map((subcat) => (
                    <Button
                      key={subcat.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 rounded-none border-foreground/20 hover:border-foreground/50 hover:bg-foreground/5"
                      onClick={() => navigate(`/order-form/${category.id}/${category.name}/${subcat.id}/${subcat.name}`)}
                    >
                      <span className="text-sm font-normal">{subcat.displayName}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
