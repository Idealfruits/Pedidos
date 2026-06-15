import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderWithLines {
  id: number;
  userId: number;
  categoryId: number;
  subcategoryId?: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  lines?: Array<{
    id: number;
    orderId: number;
    productName: string;
    provider?: string | null;
    code?: string | null;
    link?: string | null;
    quantity: number;
    urgency: string;
    photoUrl?: string | null;
    photoKey?: string | null;
    createdAt: Date;
  }>;
}

export default function OrderHistory() {
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<OrderWithLines[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getMyOrdersQuery = trpc.orders.getMyOrders.useQuery();

  useEffect(() => {
    if (getMyOrdersQuery.data) {
      setOrders(getMyOrdersQuery.data);
    }
  }, [getMyOrdersQuery.data]);

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }
    if (filterUrgency !== "all" && order.lines) {
      const hasUrgency = order.lines.some((line) => line.urgency === filterUrgency);
      if (!hasUrgency) return false;
    }
    return true;
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Borrador",
      submitted: "Enviado",
      in_progress: "En progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted/20 text-foreground/60",
      submitted: "bg-blue-100/20 text-blue-700",
      in_progress: "bg-amber-100/20 text-amber-700",
      completed: "bg-green-100/20 text-green-700",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return colors[status] || "bg-muted/20";
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      Alta: "text-red-600 font-semibold",
      Media: "text-amber-600",
      Baja: "text-green-600",
    };
    return colors[urgency] || "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container py-12 md:py-16">
          <Button
            variant="ghost"
            onClick={() => navigate("/order-portal")}
            className="mb-6 text-foreground/60 hover:text-foreground"
          >
            ← Crear nuevo pedido
          </Button>
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-serif-display)" }}>
            Historial de Pedidos
          </h1>
          <div className="w-16 h-px bg-foreground/20 mb-6"></div>
          <p className="text-lg text-foreground/70">
            Visualiza y gestiona todos tus pedidos
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block text-foreground/70">
                Filtrar por urgencia
              </label>
              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger className="rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block text-foreground/70">
                Filtrar por estado
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="submitted">Enviado</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="container py-16 md:py-24">
        {getMyOrdersQuery.isLoading && (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        )}

        {getMyOrdersQuery.error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error al cargar pedidos</p>
              <p className="text-sm text-destructive/80">{getMyOrdersQuery.error.message}</p>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/60 mb-4">No hay pedidos para mostrar</p>
            <Button
              onClick={() => navigate("/order-portal")}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-none"
            >
              Crear primer pedido
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="border-2 border-border rounded-none overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedOrder(expandedOrder === order.id ? null : order.id)
                  }
                  className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">
                        Pedido #{order.id}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60">
                      {format(new Date(order.createdAt), "d 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-foreground/70">
                      {order.lines?.length || 0} producto{order.lines?.length !== 1 ? "s" : ""}
                    </span>
                    {expandedOrder === order.id ? (
                      <ChevronUp className="w-5 h-5 text-foreground/40" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-foreground/40" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedOrder === order.id && order.lines && (
                  <div className="border-t border-border bg-card/50 p-6 md:p-8">
                    <div className="space-y-6">
                      {order.lines.map((line) => (
                        <div
                          key={line.id}
                          className="pb-6 border-b border-border/50 last:pb-0 last:border-b-0"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-1">
                                Producto
                              </p>
                              <p className="font-semibold">{line.productName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-1">
                                Urgencia
                              </p>
                              <p className={`font-semibold ${getUrgencyColor(line.urgency)}`}>
                                {line.urgency}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-1">
                                Cantidad
                              </p>
                              <p className="font-semibold">{line.quantity} unidad{line.quantity !== 1 ? "es" : ""}</p>
                            </div>
                            {line.provider && (
                              <div>
                                <p className="text-xs text-foreground/50 uppercase tracking-widest mb-1">
                                  Proveedor
                                </p>
                                <p className="font-semibold">{line.provider}</p>
                              </div>
                            )}
                            {line.code && (
                              <div>
                                <p className="text-xs text-foreground/50 uppercase tracking-widest mb-1">
                                  Código
                                </p>
                                <p className="font-semibold">{line.code}</p>
                              </div>
                            )}
                            {line.link && (
                              <div className="md:col-span-2">
                                <p className="text-xs text-foreground/50 uppercase tracking-widest mb-1">
                                  Enlace
                                </p>
                                <a
                                  href={line.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all"
                                >
                                  {line.link}
                                </a>
                              </div>
                            )}
                          </div>
                          {line.photoUrl && (
                            <div>
                              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-2">
                                Foto
                              </p>
                              <img
                                src={line.photoUrl}
                                alt="Foto del producto"
                                className="max-w-xs h-auto border border-border rounded-none"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
