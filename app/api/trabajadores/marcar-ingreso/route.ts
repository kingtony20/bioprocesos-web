import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";

const TIMEZONE_PERU = "America/Lima";

function fechaHoy() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_PERU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function horaActual() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE_PERU,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export async function POST(request: NextRequest) {
  try {
    const { trabajador_id } = await request.json();
    const id = Number(trabajador_id);

    if (!id) {
      return NextResponse.json({ success: false, error: "Falta trabajador_id" }, { status: 400 });
    }

    const hoy = fechaHoy();
    const hora = horaActual();

    const existe = db.prepare(`
      SELECT id FROM asistencias
      WHERE trabajador_id = ? AND fecha = ?
    `).get(id, hoy);

    if (existe) {
      return NextResponse.json(
        { success: false, error: "Ya marcaste ingreso hoy" },
        { status: 409 }
      );
    }

    const result = db.prepare(`
      INSERT INTO asistencias (trabajador_id, fecha, hora_ingreso)
      VALUES (?, ?, ?)
    `).run(id, hoy, hora);

    return NextResponse.json({
      success: true,
      registro: { id: result.lastInsertRowid, trabajador_id: id, fecha: hoy, hora_ingreso: hora }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Error al registrar ingreso" }, { status: 500 });
  }
}