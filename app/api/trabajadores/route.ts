// app/api/trabajadores/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";   // ajusta la ruta si es diferente

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("trabajadores")
      .select(`
        id,
        dni,
        nombre
      `)
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error al obtener trabajadores:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trabajadores: data || [],
    });
  } catch (err) {
    console.error("Excepción en GET /api/trabajadores:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}