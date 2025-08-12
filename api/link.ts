import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from "crypto";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = "postgres://neondb_owner:npg_Ng1JUpP8Xote@ep-silent-river-adq9us7c-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle({ client: pool, schema });

import { linkSessionSchema } from "../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { method, phoneNumber } = linkSessionSchema.parse(req.body);
    
    const sessionId = randomUUID();
    let pairingCode = null;
    
    if (method === "pairing") {
      // Generate 8-digit pairing code
      const digits = Math.floor(10000000 + Math.random() * 90000000);
      pairingCode = `WABridge-${digits}`;
    }

    const [session] = await db.insert(schema.sessions).values({
      sessionId,
      phoneNumber: phoneNumber || null,
      status: "connecting",
      pairingCode: pairingCode || null,
      sessionData: null,
    }).returning();

    // Create default bot settings
    await db.insert(schema.botSettings).values({
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
}