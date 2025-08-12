import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use provided Neon database URL
const DATABASE_URL = process.env.DATABASE_URL || "postgres://neondb_owner:npg_Ng1JUpP8Xote@ep-silent-river-adq9us7c-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });