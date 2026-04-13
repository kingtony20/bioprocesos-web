import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trabajador_id = searchParams.get("trabajador_id");

    if (!trabajador_id) {
      return NextResponse.json(
        { success: false, error: "Falta trabajador_id" },
        { status: 400 }
      );
    }

    const eventos = db.prepare(`
      SELECT * FROM eventos
      WHERE trabajador_id = ?
      ORDER BY fecha_inicio ASC
    `).all(Number(trabajador_id));

    return NextResponse.json({
      success: true,
      eventos
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}