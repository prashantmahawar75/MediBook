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
import { storage as mockStorage } from "./mockStorage";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Slot operations
  createSlot(slot: InsertSlot): Promise<Slot>;
  getAvailableSlots(startDate: Date, endDate: Date): Promise<SlotWithBooking[]>;
  getSlot(id: string): Promise<Slot | undefined>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<BookingWithDetails[]>;
  getAllBookings(): Promise<BookingWithDetails[]>;
  getBookingBySlot(slotId: string): Promise<Booking | undefined>;
}

// Export the mock storage directly
export const storage = mockStorage;
