import {
  type User,
  type UpsertUser,
  type Slot,
  type InsertSlot,
  type Booking,
  type InsertBooking,
  type BookingWithDetails,
  type SlotWithBooking,
} from "@shared/schema";

// Mock data storage
const users = new Map<string, User>();
const slots = new Map<string, Slot>();
const bookings = new Map<string, Booking>();

// Generate mock data
function generateMockData() {
  // Create admin user
  const adminUser: User = {
    id: "admin-user",
    email: "admin@clinic.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.set(adminUser.id, adminUser);

  // Create some patient users
  const patient1: User = {
    id: "patient-1",
    email: "patient1@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "patient",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.set(patient1.id, patient1);

  // Generate slots for next 7 days
  const today = new Date();
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate slots from 09:00 to 17:00 (30-min intervals)
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startAt = new Date(date);
        startAt.setHours(hour, minute, 0, 0);
        
        const endAt = new Date(startAt);
        endAt.setMinutes(endAt.getMinutes() + 30);
        
        const slot: Slot = {
          id: `slot-${day}-${hour}-${minute}`,
          startAt,
          endAt,
          createdAt: new Date(),
        };
        slots.set(slot.id, slot);
      }
    }
  }
}

// Initialize mock data
generateMockData();

export class MockStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id || `user-${Date.now()}`,
      email: userData.email || "",
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      role: userData.role || "patient",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    users.set(user.id, user);
    return user;
  }

  // Slot operations
  async createSlot(slotData: InsertSlot): Promise<Slot> {
    const slot: Slot = {
      id: `slot-${Date.now()}`,
      startAt: slotData.startAt,
      endAt: slotData.endAt,
      createdAt: new Date(),
    };
    
    slots.set(slot.id, slot);
    return slot;
  }

  async getAvailableSlots(startDate: Date, endDate: Date): Promise<SlotWithBooking[]> {
    const availableSlots: SlotWithBooking[] = [];
    
    for (const slot of slots.values()) {
      if (slot.startAt >= startDate && slot.startAt <= endDate) {
        const booking = this.getBookingBySlot(slot.id);
        availableSlots.push({
          ...slot,
          booking: booking || undefined,
        });
      }
    }
    
    return availableSlots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }

  async getSlot(id: string): Promise<Slot | undefined> {
    return slots.get(id);
  }

  // Booking operations
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    // Check if slot is already booked
    const existingBooking = this.getBookingBySlot(bookingData.slotId);
    if (existingBooking) {
      throw new Error("Slot is already booked");
    }
    
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      userId: bookingData.userId,
      slotId: bookingData.slotId,
      createdAt: new Date(),
    };
    
    bookings.set(booking.id, booking);
    return booking;
  }

  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const userBookings: BookingWithDetails[] = [];
    
    for (const booking of bookings.values()) {
      if (booking.userId === userId) {
        const user = users.get(booking.userId);
        const slot = slots.get(booking.slotId);
        
        if (user && slot) {
          userBookings.push({
            ...booking,
            user,
            slot,
          });
        }
      }
    }
    
    return userBookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllBookings(): Promise<BookingWithDetails[]> {
    const allBookings: BookingWithDetails[] = [];
    
    for (const booking of bookings.values()) {
      const user = users.get(booking.userId);
      const slot = slots.get(booking.slotId);
      
      if (user && slot) {
        allBookings.push({
          ...booking,
          user,
          slot,
        });
      }
    }
    
    return allBookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getBookingBySlot(slotId: string): Booking | undefined {
    for (const booking of bookings.values()) {
      if (booking.slotId === slotId) {
        return booking;
      }
    }
    return undefined;
  }
}

export const storage = new MockStorage(); 