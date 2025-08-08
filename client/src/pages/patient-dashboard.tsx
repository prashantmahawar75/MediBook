import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/header";
import AppointmentCalendar from "@/components/appointment-calendar";
import BookingPanel from "@/components/booking-panel";
import type { SlotWithBooking } from "@shared/schema";

export default function PatientDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSlot, setSelectedSlot] = useState<SlotWithBooking | undefined>();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="heading-book-appointment">
            Book Your Appointment
          </h1>
          <p className="text-gray-600">Select an available time slot for your visit</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <AppointmentCalendar 
            onSlotSelect={setSelectedSlot}
            selectedSlot={selectedSlot}
          />
          <BookingPanel 
            selectedSlot={selectedSlot}
            onBookingSuccess={() => setSelectedSlot(undefined)}
          />
        </div>
      </main>
    </div>
  );
}
