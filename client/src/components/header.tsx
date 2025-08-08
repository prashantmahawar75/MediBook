import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Calendar, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Refresh the page to trigger authentication check
        window.location.reload();
      } else {
        toast({
          title: "Logout Error",
          description: "Failed to logout. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-gray-900">MediBook</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600" data-testid="text-username">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.email}
            </span>
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}
              data-testid="text-user-role"
            >
              {user.role === 'admin' ? 'Admin' : 'Patient'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
