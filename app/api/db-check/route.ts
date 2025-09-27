import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const { rows } = await pool.query(`
    SELECT
      current_database()    AS db,
      current_user          AS usr,
      inet_server_addr()::text AS host,
      inet_server_port()    AS port,
      version()             AS version
  `);
  return NextResponse.json(rows[0]);
}
