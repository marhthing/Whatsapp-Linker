import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("whatsapp_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().unique(),
  phoneNumber: varchar("phone_number"),
  whatsappName: varchar("whatsapp_name"),
  status: varchar("status").notNull().default("inactive"), // active, inactive, failed, connecting
  sessionData: jsonb("session_data"),
  pairingCode: varchar("pairing_code"),
  qrCode: text("qr_code"),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const botSettings = pgTable("bot_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.sessionId),
  antiDeleteJid: varchar("anti_delete_jid"),
  isAntiDeleteEnabled: boolean("is_anti_delete_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminPassword: varchar("admin_password").notNull(),
  defaultAntiDeleteJid: varchar("default_anti_delete_jid"),
  adminContact: varchar("admin_contact"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type BotSettings = typeof botSettings.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;

// API Request/Response types
export const linkSessionSchema = z.object({
  method: z.enum(["qr", "pairing"]),
  phoneNumber: z.string().optional(),
});

export const updateSessionSchema = z.object({
  sessionId: z.string(),
  status: z.enum(["active", "inactive", "failed", "connecting"]),
  phoneNumber: z.string().optional(),
  whatsappName: z.string().optional(),
  sessionData: z.any().optional(),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1),
});

export const updateBotSettingsSchema = z.object({
  sessionId: z.string(),
  antiDeleteJid: z.string().optional(),
  isAntiDeleteEnabled: z.boolean().optional(),
});

export type LinkSessionRequest = z.infer<typeof linkSessionSchema>;
export type UpdateSessionRequest = z.infer<typeof updateSessionSchema>;
export type AdminLoginRequest = z.infer<typeof adminLoginSchema>;
export type UpdateBotSettingsRequest = z.infer<typeof updateBotSettingsSchema>;
