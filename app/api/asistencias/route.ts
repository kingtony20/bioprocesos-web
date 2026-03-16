import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

export async function GET() {

  try {

    const { data, error } = await supabaseServer
      .from("asistencias")
      .select("*")
      .order("fecha", { ascending: false })
      .order("hora_ingreso", { ascending: false });

    if (error) {
      console.error("Error asistencias:", error);

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      asistencias: data
    });

  } catch (err) {

    console.error("Error API asistencias:", err);

    return NextResponse.json(
      { success: false, error: "Error servidor" },
      { status: 500 }
    );

  }

}