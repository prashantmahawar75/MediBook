import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("patient"), // patient or admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointment slots table
export const slots = pgTable("slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table with unique constraint to prevent double booking
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  slotId: varchar("slot_id").notNull().references(() => slots.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.slotId), // Prevent double booking
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const slotsRelations = relations(slots, ({ one }) => ({
  booking: one(bookings, {
    fields: [slots.id],
    references: [bookings.slotId],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  slot: one(slots, {
    fields: [bookings.slotId],
    references: [slots.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertSlotSchema = createInsertSchema(slots).pick({
  startAt: true,
  endAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  userId: true,
  slotId: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Slot = typeof slots.$inferSelect;
export type InsertSlot = z.infer<typeof insertSlotSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Extended types for API responses
export type BookingWithDetails = Booking & {
  user: User;
  slot: Slot;
};

export type SlotWithBooking = Slot & {
  booking?: Booking;
};
