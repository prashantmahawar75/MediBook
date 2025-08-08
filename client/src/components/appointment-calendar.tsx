import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SlotWithBooking } from "@shared/schema";

interface AppointmentCalendarProps {
  onSlotSelect: (slot: SlotWithBooking) => void;
  selectedSlot?: SlotWithBooking;
}

export default function AppointmentCalendar({ onSlotSelect, selectedSlot }: AppointmentCalendarProps) {
  // Start from "today" at midnight (rolling 7-day window)
  const [currentStart, setCurrentStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const { data: slots = [], isLoading } = useQuery<SlotWithBooking[]>({
    queryKey: ['/api/slots'],
  });

  // Build 7 consecutive days starting from currentStart
  const displayDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentStart);
    date.setDate(currentStart.getDate() + i);
    return date;
  });

  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    return { hour, minute, label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}` };
  });

  const getSlotForDateTime = (date: Date, hour: number, minute: number): SlotWithBooking | undefined => {
    const slotDateTime = new Date(date);
    slotDateTime.setUTCHours(hour, minute, 0, 0);
    
    return slots.find((slot: SlotWithBooking) => {
      const slotStart = new Date(slot.startAt);
      return slotStart.getTime() === slotDateTime.getTime();
    });
  };

  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  const navigateWindow = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentStart);
    newStart.setDate(currentStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentStart(newStart);
  };

  const formatRange = () => {
    const endDate = new Date(currentStart);
    endDate.setDate(currentStart.getDate() + 6);
    
    return `${currentStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <div className="text-center">Loading appointment slots...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle>Available Appointments</CardTitle>
        <p className="text-sm text-gray-500">Next 7 days • 30-minute slots • 09:00-17:00 UTC</p>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Calendar Navigation */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateWindow('prev')}
            data-testid="button-prev-week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-gray-900" data-testid="text-current-week">
            {formatRange()}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateWindow('next')}
            data-testid="button-next-week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {displayDays.map((date, index) => (
              <div 
                key={index} 
                className="text-center py-2 text-sm font-medium text-gray-700 border-b border-gray-100"
                data-testid={`text-day-${index}`}
              >
                <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Time Slots Grid */}
          <div className="space-y-2">
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot.label} className="grid grid-cols-7 gap-1">
                {displayDays.map((date, dayIndex) => {
                  const slot = getSlotForDateTime(date, timeSlot.hour, timeSlot.minute);
                  const isBooked = slot?.booking;
                  const isWeekendDay = isWeekend(date);
                  const isSelected = selectedSlot && slot && selectedSlot.id === slot.id;
                  
                  if (isWeekendDay) {
                    return (
                      <div 
                        key={dayIndex} 
                        className="p-2 text-xs text-gray-300 text-center"
                        data-testid={`slot-weekend-${dayIndex}-${timeSlot.label}`}
                      >
                        -
                      </div>
                    );
                  }

                  if (!slot) {
                    return (
                      <div 
                        key={dayIndex} 
                        className="p-2 text-xs text-gray-300 text-center"
                        data-testid={`slot-unavailable-${dayIndex}-${timeSlot.label}`}
                      >
                        -
                      </div>
                    );
                  }

                  if (isBooked) {
                    return (
                      <button 
                        key={dayIndex}
                        disabled
                        className="p-2 text-xs bg-gray-100 text-gray-400 border border-gray-200 rounded cursor-not-allowed"
                        data-testid={`slot-booked-${dayIndex}-${timeSlot.label}`}
                      >
                        {timeSlot.label}
                      </button>
                    );
                  }

                  return (
                    <button 
                      key={dayIndex}
                      onClick={() => onSlotSelect(slot)}
                      className={`p-2 text-xs border rounded transition-colors ${
                        isSelected
                          ? 'bg-primary text-white border-primary'
                          : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      }`}
                      data-testid={`slot-available-${dayIndex}-${timeSlot.label}`}
                    >
                      {timeSlot.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span className="text-gray-600">Booked</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
