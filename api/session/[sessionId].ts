import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../../shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });
import { eq } from "drizzle-orm";
import { updateSessionSchema } from "../../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { sessionId } = req.query;

  if (typeof sessionId !== 'string') {
    return res.status(400).json({ message: 'Invalid session ID' });
  }

  if (req.method === 'GET') {
    try {
      const [session] = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.sessionId, sessionId));
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Get session error:", error);
      res.status(500).json({ message: "Failed to get session" });
    }
  } else if (req.method === 'PUT') {
    try {
      const updates = updateSessionSchema.parse({ sessionId, ...req.body });
      
      const [session] = await db
        .update(schema.sessions)
        .set({
          status: updates.status,
          phoneNumber: updates.phoneNumber,
          whatsappName: updates.whatsappName,
          sessionData: updates.sessionData,
          lastActive: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.sessions.sessionId, sessionId))
        .returning();

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
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}