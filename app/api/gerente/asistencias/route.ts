import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

function parseTrabajadorId(valor: string | null) {
  if (!valor) return null;
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trabajador_id_param = searchParams.get("trabajador_id");
    const fecha = searchParams.get("fecha"); // YYYY-MM-DD (para dashboard)
    const desde = searchParams.get("desde"); // YYYY-MM-DD (para detalle/rango)
    const hasta = searchParams.get("hasta"); // YYYY-MM-DD

    let query = supabaseServer
      .from("asistencias")
      .select("id,trabajador_id,fecha,hora_ingreso,hora_salida,created_at");

    const trabajadorId = parseTrabajadorId(trabajador_id_param);
    if (trabajador_id_param && !trabajadorId) {
      return NextResponse.json({ success: false, error: "trabajador_id inválido" }, { status: 400 });
    }
    if (trabajadorId) query = query.eq("trabajador_id", trabajadorId);

    if (fecha) {
      query = query.eq("fecha", fecha);
    } else {
      if (desde) query = query.gte("fecha", desde);
      if (hasta) query = query.lte("fecha", hasta);
    }

    query = query.order("fecha", { ascending: false }).order("hora_ingreso", { ascending: false }).limit(200);

    const { data, error } = await query;

    if (error) {
      console.error("Error al consultar asistencias:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      asistencias: data || [],
      count: data?.length || 0,
      message: data?.length
        ? `Se encontraron ${data.length} registros`
        : "No hay asistencias registradas"
    });

  } catch (err) {
    console.error("Excepción en GET /api/gerente/asistencias:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}