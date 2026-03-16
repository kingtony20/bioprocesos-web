import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {

  try {

    const trabajador_id = request.nextUrl.searchParams.get("trabajador_id");

    if (!trabajador_id) {
      return NextResponse.json(
        { success: false, error: "Falta trabajador_id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("asistencias")
      .select("*")
      .eq("trabajador_id", trabajador_id);

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

    console.error("Error /asistencias:", err);

    return NextResponse.json(
      { success: false, error: "Error servidor" },
      { status: 500 }
    );

  }

}