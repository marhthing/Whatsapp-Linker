import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../../shared/schema";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = "postgres://neondb_owner:npg_Ng1JUpP8Xote@ep-silent-river-adq9us7c-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle({ client: pool, schema });
import { desc, eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const allSessions = await db
        .select()
        .from(schema.sessions)
        .orderBy(desc(schema.sessions.createdAt));
      
      // Calculate stats
      const stats = {
        total: allSessions.length,
        active: allSessions.filter(s => s.status === "active").length,
        inactive: allSessions.filter(s => s.status === "inactive").length,
        failed: allSessions.filter(s => s.status === "failed").length,
      };

      res.json({ sessions: allSessions, stats });
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({ message: "Failed to get sessions" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}