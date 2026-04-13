import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Validar ID
function parseId(param: string) {
  const n = Number(param);
  return Number.isFinite(n) && n > 0 ? n : null;
}

//
// 🔹 PATCH → actualizar evento
//
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventoId = parseId(params.id);

    if (!eventoId) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const camposPermitidos = [
      "tipo",
      "fecha_inicio",
      "fecha_fin",
      "hora_inicio",
      "hora_fin",
      "todo_el_dia",
      "descripcion",
      "color",
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const campo of camposPermitidos) {
      if (campo in body) {
        updates.push(`${campo} = ?`);

        // manejar booleano (SQLite usa 0/1)
        if (campo === "todo_el_dia") {
          values.push(body[campo] ? 1 : 0);
        } else {
          values.push(body[campo]);
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    values.push(eventoId);

    db.prepare(`
      UPDATE eventos
      SET ${updates.join(", ")}
      WHERE id = ?
    `).run(...values);

    const eventoActualizado = db
      .prepare(`SELECT * FROM eventos WHERE id = ?`)
      .get(eventoId);

    return NextResponse.json({
      success: true,
      evento: eventoActualizado,
    });

  } catch (err) {
    console.error("Error PATCH evento:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

//
// 🔹 DELETE → eliminar evento
//
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventoId = parseId(params.id);

    if (!eventoId) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    // Verificar si existe
    const existe = db
      .prepare(`SELECT id FROM eventos WHERE id = ?`)
      .get(eventoId);

    if (!existe) {
      return NextResponse.json(
        { success: false, error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    db.prepare(`DELETE FROM eventos WHERE id = ?`).run(eventoId);

    return NextResponse.json({
      success: true,
      message: "Evento eliminado correctamente",
    });

  } catch (err) {
    console.error("Error DELETE evento:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}