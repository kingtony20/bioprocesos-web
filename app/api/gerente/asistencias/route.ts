import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    // Obtener el parámetro trabajador_id de la URL (query string)
    const { searchParams } = new URL(request.url);
    const trabajador_id = searchParams.get("trabajador_id");

    if (!trabajador_id) {
      return NextResponse.json(
        { success: false, error: "Falta el parámetro trabajador_id" },
        { status: 400 }
      );
    }

    // Consulta: todas las asistencias de ese trabajador
    // Ordenadas por fecha descendente (las más recientes primero)
    const { data, error } = await supabaseServer
      .from("asistencias")
      .select(`
        id,
        trabajador_id,
        fecha,
        hora_ingreso,
        hora_salida,
        created_at
      `)
      .eq("trabajador_id", trabajador_id)
      .order("fecha", { ascending: false });   // más reciente primero

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
        : "No hay asistencias registradas para este trabajador"
    });

  } catch (err) {
    console.error("Excepción en GET /api/asistencias:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}