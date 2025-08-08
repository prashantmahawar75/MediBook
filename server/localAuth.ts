import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Extend session interface
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  return session({
    secret: process.env.SESSION_SECRET || "local-dev-secret",
    store: undefined, // Use default memory store
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for local development
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Mock authentication endpoints for local development
  app.post('/api/login', async (req, res) => {
    const { email, role = 'patient' } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      // Create or get user
      const user = await storage.upsertUser({
        id: `local-${email}`,
        email,
        firstName: email.split('@')[0],
        lastName: 'User',
        role: role as 'patient' | 'admin',
      });

      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      res.json({ 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', async (req: any, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = {
      claims: {
        sub: user.id,
        email: user.email,
        role: user.role
      }
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
}; 