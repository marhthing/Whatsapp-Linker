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
import { adminLoginSchema } from "../../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { password } = adminLoginSchema.parse(req.body);
    const [settings] = await db.select().from(schema.adminSettings).limit(1);
    
    if (!settings || settings.adminPassword !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(400).json({ message: "Login failed" });
  }
}