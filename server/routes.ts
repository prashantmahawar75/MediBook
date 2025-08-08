import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed data function
  async function seedData() {
    // Create admin user if not exists
    try {
      await storage.upsertUser({
        id: "admin-user",
        email: "admin@clinic.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      });
    } catch (error) {
      console.log("Admin user already exists or error creating:", error);
    }

    // Generate slots for next 7 days if none exist
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);
    
    const existingSlots = await storage.getAvailableSlots(today, endDate);
    
    if (existingSlots.length === 0) {
      console.log("Generating appointment slots...");
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() + day);
        
        // Skip weekends for clinic hours
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        // Generate slots from 09:00 to 17:00 (30-min intervals)
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const startAt = new Date(date);
            startAt.setUTCHours(hour, minute, 0, 0);
            
            const endAt = new Date(startAt);
            endAt.setMinutes(endAt.getMinutes() + 30);
            
            try {
              await storage.createSlot({ startAt, endAt });
            } catch (error) {
              console.log("Error creating slot:", error);
            }
          }
        }
      }
      console.log("Appointment slots generated successfully");
    }
  }

  // Seed data on startup
  await seedData();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  app.get('/api/slots', async (req, res) => {
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);
      
      const slots = await storage.getAvailableSlots(today, endDate);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      res.status(500).json({ message: "Failed to fetch slots" });
    }
  });

  // Protected patient routes
  app.post('/api/book', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId,
      });

      // Check if slot is already booked
      const existingBooking = await storage.getBookingBySlot(bookingData.slotId);
      if (existingBooking) {
        return res.status(409).json({ message: "This slot is already booked" });
      }

      // Check if slot exists
      const slot = await storage.getSlot(bookingData.slotId);
      if (!slot) {
        return res.status(404).json({ message: "Slot not found" });
      }

      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/my-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Protected admin routes
  app.get('/api/all-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
