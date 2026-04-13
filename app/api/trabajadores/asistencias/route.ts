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

    const asistencias = db.prepare(`
      SELECT * FROM asistencias
      WHERE trabajador_id = ?
      ORDER BY fecha DESC, hora_ingreso DESC
      LIMIT 100
    `).all(Number(trabajador_id));

    return NextResponse.json({
      success: true,
      asistencias,
      count: asistencias.length
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Error al obtener asistencias" },
      { status: 500 }
    );
  }
}