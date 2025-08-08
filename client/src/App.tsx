import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import PatientDashboard from "@/pages/patient-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/patient" component={PatientDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={user?.role === 'admin' ? AdminDashboard : PatientDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
