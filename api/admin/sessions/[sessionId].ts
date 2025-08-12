import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../../../shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { sessionId } = req.query;

  if (typeof sessionId !== 'string') {
    return res.status(400).json({ message: 'Invalid session ID' });
  }

  if (req.method === 'DELETE') {
    try {
      const result = await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.sessionId, sessionId));
      
      if ((result.rowCount || 0) === 0) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      console.error("Delete session error:", error);
      res.status(500).json({ message: "Failed to delete session" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}