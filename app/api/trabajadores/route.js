import "@/lib/initDB"; // 👈 ESTO CREA LAS TABLAS
import db from "@/lib/db";

export async function GET() {
  const trabajadores = db.prepare("SELECT * FROM trabajadores").all();

  return Response.json(trabajadores);
}