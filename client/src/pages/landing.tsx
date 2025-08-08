import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">MediBook</h1>
            </div>
            <Button 
              onClick={() => setLocation("/login")}
              className="bg-primary hover:bg-blue-700"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <Calendar className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Book Your Medical Appointments Online
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Schedule your clinic visits quickly and easily. View available time slots, 
            book appointments, and manage your healthcare schedule all in one place.
          </p>
          <Button 
            size="lg" 
            onClick={() => setLocation("/login")}
            className="bg-primary hover:bg-blue-700 text-lg px-8 py-3"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simple Appointment Booking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  30-Minute Slots
                </h3>
                <p className="text-gray-600">
                  Convenient 30-minute appointment slots from 09:00 to 17:00 UTC, 
                  Monday through Friday.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  7-Day Calendar
                </h3>
                <p className="text-gray-600">
                  View and book appointments up to 7 days in advance with 
                  real-time availability updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Secure & Reliable
                </h3>
                <p className="text-gray-600">
                  Your appointments are protected with secure authentication and 
                  double-booking prevention.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Schedule Your Appointment?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our clinic management system and take control of your healthcare schedule.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setLocation("/login")}
            className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3"
            data-testid="button-sign-in-cta"
          >
            Sign In Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-6 w-6" />
            <span className="text-lg font-semibold">MediBook</span>
          </div>
          <p className="text-gray-400">
            © 2024 MediBook. Professional appointment booking for healthcare.
          </p>
        </div>
      </footer>
    </div>
  );
}
