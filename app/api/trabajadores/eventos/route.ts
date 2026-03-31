import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trabajador_id = searchParams.get("trabajador_id");

    if (!trabajador_id) {
      return NextResponse.json({ success: false, error: "Falta trabajador_id" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("eventos")
      .select("*")
      .eq("trabajador_id", parseInt(trabajador_id))
      .order("fecha_inicio", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      eventos: data || [],
    });
  } catch (err) {
    console.error("Error al obtener eventos:", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}