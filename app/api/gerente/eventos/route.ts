import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

function parseTrabajadorId(valor: unknown) {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : null;
}

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
      todo_el_dia = true,
      color,
    } = body;

    // Validaciones mínimas
    const trabajadorId = parseTrabajadorId(trabajador_id);
    if (!trabajadorId || !tipo || !fecha_inicio) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios: trabajador_id, tipo, fecha_inicio" },
        { status: 400 }
      );
    }

    // Identidad del gerente: enviar desde el frontend como header `x-gerente-id`
    const gerenteId = request.headers.get("x-gerente-id") || null;

    const { data, error } = await supabaseServer
      .from("eventos")
      .insert({
        trabajador_id: trabajadorId,
        creado_por: gerenteId,
        tipo,
        fecha_inicio,
        fecha_fin: fecha_fin || null,
        hora_inicio: hora_inicio || null,
        hora_fin: hora_fin || null,
        descripcion: descripcion || null,
        todo_el_dia,
        color: color || "#a78bfa", // violeta por defecto
      })
      .select()
      .single();

    if (error) {
      console.error("Error al crear evento:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      evento: data,
    });
  } catch (err) {
    console.error("Excepción en POST /api/eventos:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trabajador_id = searchParams.get("trabajador_id");
    const desde = searchParams.get("desde"); // YYYY-MM-DD
    const hasta = searchParams.get("hasta");

    let query = supabaseServer.from("eventos").select("*");

    if (trabajador_id) {
      const trabajadorId = parseTrabajadorId(trabajador_id);
      if (!trabajadorId) {
        return NextResponse.json({ success: false, error: "trabajador_id inválido" }, { status: 400 });
      }
      query = query.eq("trabajador_id", trabajadorId);
    }

    if (desde) query = query.gte("fecha_inicio", desde);
    if (hasta) query = query.lte("fecha_inicio", hasta);

    const { data, error } = await query.order("fecha_inicio", { ascending: true });

    if (error) {
      console.error("Error al listar eventos:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, eventos: data || [] });
  } catch (err) {
    console.error("Excepción en GET /api/gerente/eventos:", err);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}