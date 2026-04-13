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

    const registro = db.prepare(`
      SELECT id, hora_salida FROM asistencias
      WHERE trabajador_id = ? AND fecha = ?
    `).get(id, hoy);

    if (!registro) {
      return NextResponse.json(
        { success: false, error: "No has marcado ingreso hoy" },
        { status: 400 }
      );
    }

    if (registro.hora_salida) {
      return NextResponse.json(
        { success: false, error: "Ya marcaste salida hoy" },
        { status: 409 }
      );
    }

    db.prepare(`
      UPDATE asistencias
      SET hora_salida = ?
      WHERE id = ?
    `).run(hora, registro.id);

    return NextResponse.json({
      success: true,
      registro: { ...registro, hora_salida: hora }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Error al registrar salida" }, { status: 500 });
  }
}