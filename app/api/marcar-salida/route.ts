import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {

  try {

    const { trabajador_id } = await request.json();

    if (!trabajador_id) {
      return NextResponse.json(
        { success: false, error: "Falta trabajador_id" },
        { status: 400 }
      );
    }

    const hoy = new Date().toISOString().split("T")[0];

    const { data, error } = await supabaseServer
      .from("asistencias")
      .update({
        hora_salida: new Date().toTimeString().slice(0,5)
      })
      .eq("trabajador_id", trabajador_id)
      .eq("fecha", hoy)
      .select()
      .single();

    if (error) {
      console.error("Error salida:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      registro: data
    });

  } catch (err) {

    console.error("Error /marcar-salida:", err);

    return NextResponse.json(
      { success: false, error: "Error servidor" },
      { status: 500 }
    );

  }

}