# Overview

This is a minimal appointment booking web application designed for small clinics. The system enables patients to book 30-minute time slots during clinic hours (09:00-17:00 UTC) and allows administrators to manage all appointments. The application provides a clean, modern interface for both patient and admin workflows with real-time booking management and prevents double-booking through database constraints.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Single-page application using Wouter for client-side routing
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design system
- **State Management**: TanStack React Query for server state management and caching
- **Authentication Flow**: Replit Auth integration with role-based access control (patient/admin)
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Express.js Server**: RESTful API with TypeScript support
- **Database Integration**: Drizzle ORM with PostgreSQL using Neon serverless database
- **Authentication**: Replit Auth with session-based authentication using express-session
- **Route Protection**: Middleware-based authentication and role-based authorization
- **Data Validation**: Zod schemas for type-safe request/response validation

## Database Design
- **Users Table**: Stores user information with role-based access (patient/admin)
- **Slots Table**: Defines available appointment time slots with start/end times
- **Bookings Table**: Links users to slots with unique constraint preventing double-booking
- **Sessions Table**: Required for Replit Auth session management

## Key Features
- **Appointment Calendar**: Interactive weekly calendar view for slot selection
- **Real-time Updates**: Automatic refresh of available slots after booking
- **Booking Management**: Patients can view their appointments, admins see all bookings
- **Time Slot Generation**: Automated creation of 30-minute slots during business hours
- **Conflict Prevention**: Database-level unique constraints prevent double-booking

## API Architecture
- **Authentication Routes**: `/api/login`, `/api/logout`, `/api/auth/user`
- **Slot Management**: `/api/slots` for viewing available time slots
- **Booking Operations**: `/api/book` for creating appointments, `/api/my-bookings` and `/api/all-bookings` for viewing
- **Error Handling**: Structured JSON error responses with appropriate HTTP status codes

# External Dependencies

## Database & ORM
- **Neon Database**: PostgreSQL serverless database for production deployment
- **Drizzle ORM**: Type-safe database queries and migrations
- **@neondatabase/serverless**: WebSocket-based database connection for serverless environments

## Authentication & Security
- **Replit Auth**: OAuth-based authentication system with user session management
- **express-session**: Server-side session storage with PostgreSQL backing
- **connect-pg-simple**: PostgreSQL session store for persistent authentication

## Frontend Libraries
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight client-side routing
- **@radix-ui/***: Headless UI components for accessibility
- **lucide-react**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across frontend and backend
- **TailwindCSS**: Utility-first CSS framework for rapid styling
- **ESBuild**: Fast JavaScript bundling for production builds
