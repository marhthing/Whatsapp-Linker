import {
  sessions,
  botSettings,
  adminSettings,
  type Session,
  type InsertSession,
  type BotSettings,
  type InsertBotSettings,
  type AdminSettings,
  type InsertAdminSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  updateSession(sessionId: string, updates: Partial<InsertSession>): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
  
  // Bot settings operations
  createBotSettings(settings: InsertBotSettings): Promise<BotSettings>;
  getBotSettings(sessionId: string): Promise<BotSettings | undefined>;
  updateBotSettings(sessionId: string, updates: Partial<InsertBotSettings>): Promise<BotSettings | undefined>;
  
  // Admin settings operations
  getAdminSettings(): Promise<AdminSettings | undefined>;
  createAdminSettings(settings: InsertAdminSettings): Promise<AdminSettings>;
  updateAdminSettings(updates: Partial<InsertAdminSettings>): Promise<AdminSettings | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Session operations
  async createSession(sessionData: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, sessionId));
    return session;
  }

  async getAllSessions(): Promise<Session[]> {
    return await db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.createdAt));
  }

  async updateSession(sessionId: string, updates: Partial<InsertSession>): Promise<Session | undefined> {
    const [session] = await db
      .update(sessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sessions.sessionId, sessionId))
      .returning();
    return session;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await db
      .delete(sessions)
      .where(eq(sessions.sessionId, sessionId));
    return (result.rowCount || 0) > 0;
  }

  // Bot settings operations
  async createBotSettings(settingsData: InsertBotSettings): Promise<BotSettings> {
    const [settings] = await db
      .insert(botSettings)
      .values(settingsData)
      .returning();
    return settings;
  }

  async getBotSettings(sessionId: string): Promise<BotSettings | undefined> {
    const [settings] = await db
      .select()
      .from(botSettings)
      .where(eq(botSettings.sessionId, sessionId));
    return settings;
  }

  async updateBotSettings(sessionId: string, updates: Partial<InsertBotSettings>): Promise<BotSettings | undefined> {
    const [settings] = await db
      .update(botSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(botSettings.sessionId, sessionId))
      .returning();
    return settings;
  }

  // Admin settings operations
  async getAdminSettings(): Promise<AdminSettings | undefined> {
    const [settings] = await db
      .select()
      .from(adminSettings)
      .limit(1);
    return settings;
  }

  async createAdminSettings(settingsData: InsertAdminSettings): Promise<AdminSettings> {
    const [settings] = await db
      .insert(adminSettings)
      .values(settingsData)
      .returning();
    return settings;
  }

  async updateAdminSettings(updates: Partial<InsertAdminSettings>): Promise<AdminSettings | undefined> {
    const existing = await this.getAdminSettings();
    if (!existing) {
      return undefined;
    }
    
    const [settings] = await db
      .update(adminSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adminSettings.id, existing.id))
      .returning();
    return settings;
  }
}

export const storage = new DatabaseStorage();
