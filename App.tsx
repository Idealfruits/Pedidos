import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import OrderPortal from "./pages/OrderPortal";
import OrderForm from "./pages/OrderForm";
import OrderHistory from "./pages/OrderHistory";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/order-portal" component={OrderPortal} />
      <Route path="/order-form/:categoryId/:categoryName/:subcategoryId/:subcategoryName" component={OrderForm} />
      <Route path="/order-form/:categoryId/:categoryName" component={OrderForm} />
      <Route path="/order-history" component={OrderHistory} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
