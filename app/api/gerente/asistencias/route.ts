import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

function parseTrabajadorId(valor: string | null) {
  if (!valor) return null;
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const trabajador_id_param = searchParams.get("trabajador_id");
    const fecha = searchParams.get("fecha");
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    let query = `SELECT * FROM asistencias WHERE 1=1`;
    const params: any[] = [];

    const trabajadorId = parseTrabajadorId(trabajador_id_param);
    if (trabajador_id_param && !trabajadorId) {
      return NextResponse.json({ success: false, error: "trabajador_id inválido" }, { status: 400 });
    }

    if (trabajadorId) {
      query += ` AND trabajador_id = ?`;
      params.push(trabajadorId);
    }

    if (fecha) {
      query += ` AND fecha = ?`;
      params.push(fecha);
    } else {
      if (desde) {
        query += ` AND fecha >= ?`;
        params.push(desde);
      }
      if (hasta) {
        query += ` AND fecha <= ?`;
        params.push(hasta);
      }
    }

    query += ` ORDER BY fecha DESC, hora_ingreso DESC LIMIT 200`;

    const asistencias = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      asistencias,
      count: asistencias.length
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}