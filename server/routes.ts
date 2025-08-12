import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import {
  linkSessionSchema,
  updateSessionSchema,
  adminLoginSchema,
  updateBotSettingsSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize admin settings if they don't exist
  const adminSettings = await storage.getAdminSettings();
  if (!adminSettings) {
    await storage.createAdminSettings({
      adminPassword: process.env.ADMIN_PASSWORD || "admin123",
      defaultAntiDeleteJid: "",
      adminContact: "",
    });
  }

  // Public API - Link WhatsApp session
  app.post("/api/link", async (req, res) => {
    try {
      const { method, phoneNumber } = linkSessionSchema.parse(req.body);
      
      const sessionId = randomUUID();
      let pairingCode = null;
      
      if (method === "pairing") {
        // Generate 8-digit pairing code
        const digits = Math.floor(10000000 + Math.random() * 90000000);
        pairingCode = `WABridge-${digits}`;
      }

      const session = await storage.createSession({
        sessionId,
        phoneNumber: phoneNumber || null,
        status: "connecting",
        pairingCode,
        sessionData: null,
      });

      // Create default bot settings
      await storage.createBotSettings({
        sessionId,
        antiDeleteJid: null,
        isAntiDeleteEnabled: true,
      });

      res.json({
        sessionId: session.sessionId,
        pairingCode: session.pairingCode,
        status: session.status,
      });
    } catch (error) {
      console.error("Link session error:", error);
      res.status(400).json({ 
        message: "Failed to create session", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get session by ID (for bot to retrieve session data)
  app.get("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Get session error:", error);
      res.status(500).json({ message: "Failed to get session" });
    }
  });

  // Update session (for bot to update session data)
  app.put("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = updateSessionSchema.parse({ sessionId, ...req.body });
      
      const session = await storage.updateSession(sessionId, {
        status: updates.status,
        phoneNumber: updates.phoneNumber,
        whatsappName: updates.whatsappName,
        sessionData: updates.sessionData,
        lastActive: new Date(),
      });

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Update session error:", error);
      res.status(400).json({ 
        message: "Failed to update session", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = adminLoginSchema.parse(req.body);
      const adminSettings = await storage.getAdminSettings();
      
      if (!adminSettings || adminSettings.adminPassword !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // In a real app, you'd use proper session management
      res.json({ success: true, message: "Login successful" });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  // Get all sessions (admin only)
  app.get("/api/admin/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      
      // Calculate stats
      const stats = {
        total: sessions.length,
        active: sessions.filter(s => s.status === "active").length,
        inactive: sessions.filter(s => s.status === "inactive").length,
        failed: sessions.filter(s => s.status === "failed").length,
      };

      res.json({ sessions, stats });
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({ message: "Failed to get sessions" });
    }
  });

  // Delete session (admin only)
  app.delete("/api/admin/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const success = await storage.deleteSession(sessionId);
      
      if (!success) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      console.error("Delete session error:", error);
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Get bot settings
  app.get("/api/bot-settings/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const settings = await storage.getBotSettings(sessionId);
      
      if (!settings) {
        return res.status(404).json({ message: "Bot settings not found" });
      }

      res.json(settings);
    } catch (error) {
      console.error("Get bot settings error:", error);
      res.status(500).json({ message: "Failed to get bot settings" });
    }
  });

  // Update bot settings
  app.put("/api/bot-settings/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = updateBotSettingsSchema.parse({ sessionId, ...req.body });
      
      const settings = await storage.updateBotSettings(sessionId, {
        antiDeleteJid: updates.antiDeleteJid,
        isAntiDeleteEnabled: updates.isAntiDeleteEnabled,
      });

      if (!settings) {
        return res.status(404).json({ message: "Bot settings not found" });
      }

      res.json(settings);
    } catch (error) {
      console.error("Update bot settings error:", error);
      res.status(400).json({ message: "Failed to update bot settings" });
    }
  });

  // Get admin settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getAdminSettings();
      if (!settings) {
        return res.status(404).json({ message: "Admin settings not found" });
      }
      
      // Don't send password back
      const { adminPassword, ...safeSettings } = settings;
      res.json(safeSettings);
    } catch (error) {
      console.error("Get admin settings error:", error);
      res.status(500).json({ message: "Failed to get admin settings" });
    }
  });

  // Update admin settings
  app.put("/api/admin/settings", async (req, res) => {
    try {
      const { defaultAntiDeleteJid, adminContact } = req.body;
      
      const settings = await storage.updateAdminSettings({
        defaultAntiDeleteJid,
        adminContact,
      });

      if (!settings) {
        return res.status(404).json({ message: "Admin settings not found" });
      }

      const { adminPassword, ...safeSettings } = settings;
      res.json(safeSettings);
    } catch (error) {
      console.error("Update admin settings error:", error);
      res.status(500).json({ message: "Failed to update admin settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
