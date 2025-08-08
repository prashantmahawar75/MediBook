import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { SlotWithBooking, BookingWithDetails } from "@shared/schema";

interface BookingPanelProps {
  selectedSlot?: SlotWithBooking;
  onBookingSuccess: () => void;
}

export default function BookingPanel({ selectedSlot, onBookingSuccess }: BookingPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userBookings = [], isLoading: isLoadingBookings } = useQuery<BookingWithDetails[]>({
    queryKey: ['/api/my-bookings'],
  });

  const bookingMutation = useMutation({
    mutationFn: async (slotId: string) => {
      await apiRequest('POST', '/api/book', { slotId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment booked successfully!",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/slots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-bookings'] });
      onBookingSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      let errorMessage = "Failed to book appointment. Please try again.";
      if (error.message.includes("409")) {
        errorMessage = "This slot is already booked. Please select another time.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const formatDateTime = (date: string | Date) => {
    const dateObj = new Date(date);
    return {
      date: dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
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
      })} UTC`
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

  return (
    <div className="space-y-6">
      {/* Selected Appointment */}
      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600" data-testid="text-selected-date">
                {formatDateTime(selectedSlot.startAt).date}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600" data-testid="text-selected-time">
                {formatDateTime(selectedSlot.startAt).time}
              </span>
            </div>
            
            <Button 
              className="w-full mt-4 bg-primary hover:bg-blue-700"
              onClick={() => bookingMutation.mutate(selectedSlot.id)}
              disabled={bookingMutation.isPending}
              data-testid="button-confirm-booking"
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* My Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
            <div className="text-center text-gray-500">Loading appointments...</div>
          ) : userBookings.length === 0 ? (
            <div className="text-center text-gray-500 text-sm" data-testid="text-no-bookings">
              No appointments booked yet
            </div>
          ) : (
            <div className="space-y-4">
              {userBookings.map((booking: BookingWithDetails) => {
                const { date, time } = formatDateTime(booking.slot.startAt);
                const status = getBookingStatus(booking);
                
                return (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    data-testid={`booking-${booking.id}`}
                  >
                    <div>
                      <div className="font-medium text-gray-900" data-testid={`booking-date-${booking.id}`}>
                        {date.split(',')[1]?.trim()} {/* Extract just the date part */}
                      </div>
                      <div className="text-sm text-gray-500" data-testid={`booking-time-${booking.id}`}>
                        {time}
                      </div>
                    </div>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                      data-testid={`booking-status-${booking.id}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
