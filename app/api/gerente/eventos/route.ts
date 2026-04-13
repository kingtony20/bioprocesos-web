import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

function parseTrabajadorId(valor: unknown) {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// 🔹 POST → crear evento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      trabajador_id,
      tipo,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      descripcion,
      todo_el_dia = 1,
      color
    } = body;

    const trabajadorId = parseTrabajadorId(trabajador_id);

    if (!trabajadorId || !tipo || !fecha_inicio) {
      return NextResponse.json(
        { success: false, error: "Faltan campos" },
        { status: 400 }
      );
    }

    const gerenteId = request.headers.get("x-gerente-id");

    const result = db.prepare(`
      INSERT INTO eventos (
        trabajador_id, creado_por, tipo,
        fecha_inicio, fecha_fin, hora_inicio, hora_fin,
        descripcion, todo_el_dia, color
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      trabajadorId,
      gerenteId,
      tipo,
      fecha_inicio,
      fecha_fin || null,
      hora_inicio || null,
      hora_fin || null,
      descripcion || null,
      todo_el_dia ? 1 : 0,
      color || "#a78bfa"
    );

    const evento = db.prepare(`SELECT * FROM eventos WHERE id = ?`)
      .get(result.lastInsertRowid);

    return NextResponse.json({ success: true, evento });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

// 🔹 GET → listar eventos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const trabajador_id = searchParams.get("trabajador_id");
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    let query = `SELECT * FROM eventos WHERE 1=1`;
    const params: any[] = [];

    if (trabajador_id) {
      const id = Number(trabajador_id);
      if (!id) {
        return NextResponse.json({ success: false, error: "trabajador_id inválido" }, { status: 400 });
      }
      query += ` AND trabajador_id = ?`;
      params.push(id);
    }

    if (desde) {
      query += ` AND fecha_inicio >= ?`;
      params.push(desde);
    }

    if (hasta) {
      query += ` AND fecha_inicio <= ?`;
      params.push(hasta);
    }

    query += ` ORDER BY fecha_inicio ASC`;

    const eventos = db.prepare(query).all(...params);

    return NextResponse.json({ success: true, eventos });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}