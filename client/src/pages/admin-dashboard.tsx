import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookingWithDetails } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: allBookings = [], isLoading: isLoadingBookings, refetch } = useQuery<BookingWithDetails[]>({
    queryKey: ['/api/all-bookings'],
  });

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayBookings = allBookings.filter((booking: BookingWithDetails) => {
    const bookingDate = new Date(booking.slot.startAt);
    return bookingDate >= today && bookingDate < tomorrow;
  });

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay() + 1);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 7);

  const thisWeekBookings = allBookings.filter((booking: BookingWithDetails) => {
    const bookingDate = new Date(booking.slot.startAt);
    return bookingDate >= thisWeekStart && bookingDate < thisWeekEnd;
  });

  const uniquePatients = new Set(allBookings.map((booking: BookingWithDetails) => booking.userId)).size;

  const formatDateTime = (date: string | Date) => {
    const dateObj = new Date(date);
    return {
      date: dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: `${dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })} - ${new Date(dateObj.getTime() + 30 * 60000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })}`
    };
  };

  const getBookingStatus = (booking: BookingWithDetails) => {
    const now = new Date();
    const slotStart = new Date(booking.slot.startAt);
    
    if (slotStart < now) {
      return { label: 'Completed', className: 'bg-gray-100 text-gray-800' };
    }
    
    return { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' };
  };

  const getInitials = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="heading-admin-dashboard">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage all clinic appointments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-today-count">
                    {todayBookings.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-patient-count">
                    {uniquePatients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-week-count">
                    {thisWeekBookings.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-bookings">
                    {allBookings.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Bookings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Appointments</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoadingBookings}
                data-testid="button-refresh-bookings"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingBookings ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoadingBookings ? (
              <div className="p-6 text-center">Loading appointments...</div>
            ) : allBookings.length === 0 ? (
              <div className="p-6 text-center text-gray-500" data-testid="text-no-appointments">
                No appointments found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booked
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allBookings.map((booking: BookingWithDetails) => {
                      const { date, time } = formatDateTime(booking.slot.startAt);
                      const status = getBookingStatus(booking);
                      const initials = getInitials(booking.user.firstName, booking.user.lastName, booking.user.email);
                      
                      return (
                        <tr key={booking.id} data-testid={`booking-row-${booking.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {initials}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900" data-testid={`patient-name-${booking.id}`}>
                                  {booking.user.firstName && booking.user.lastName 
                                    ? `${booking.user.firstName} ${booking.user.lastName}`
                                    : 'Patient'}
                                </div>
                                <div className="text-sm text-gray-500" data-testid={`patient-email-${booking.id}`}>
                                  {booking.user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`booking-date-${booking.id}`}>
                            {date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`booking-time-${booking.id}`}>
                            {time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                              data-testid={`booking-status-${booking.id}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-testid={`booking-created-${booking.id}`}>
                            {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
