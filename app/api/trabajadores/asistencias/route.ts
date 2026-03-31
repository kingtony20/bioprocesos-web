import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trabajador_id = searchParams.get("trabajador_id");

    if (!trabajador_id) {
      return NextResponse.json(
        { success: false, error: "Falta el parámetro trabajador_id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("asistencias")
      .select("*")
      .eq("trabajador_id", parseInt(trabajador_id))  // importante: convertir a número
      .order("fecha", { ascending: false })
      .order("hora_ingreso", { ascending: false })
      .limit(100);  // opcional: limita para no traer miles de filas

    if (error) throw error;

    return NextResponse.json({
      success: true,
      asistencias: data || [],
      count: data?.length || 0
    });
  } catch (err) {
    console.error("Error en GET /api/trabajadores/asistencias:", err);
    return NextResponse.json(
      { success: false, error: "Error al obtener asistencias" },
      { status: 500 }
    );
  }
}