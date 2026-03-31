import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

const TIMEZONE_PERU = "America/Lima";

function fechaHoyPeruISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_PERU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function horaPeruHHmm() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE_PERU,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export async function POST(request: NextRequest) {
  try {
    const { trabajador_id } = await request.json();

    const trabajadorId = Number(trabajador_id);
    if (!Number.isFinite(trabajadorId) || trabajadorId <= 0) {
      return NextResponse.json({ success: false, error: "Falta trabajador_id" }, { status: 400 });
    }

    const hoy = fechaHoyPeruISO();
    const hora = horaPeruHHmm();

    // Verificar que existe ingreso hoy
    const { data: registro, error: errFind } = await supabaseServer
      .from("asistencias")
      .select("id, hora_salida")
      .eq("trabajador_id", trabajadorId)
      .eq("fecha", hoy)
      .maybeSingle();

    if (errFind) throw errFind;
    if (!registro) {
      return NextResponse.json({ success: false, error: "No has marcado ingreso hoy" }, { status: 400 });
    }
    if (registro.hora_salida) {
      return NextResponse.json({ success: false, error: "Ya marcaste salida hoy" }, { status: 409 });
    }

    const { data, error } = await supabaseServer
      .from("asistencias")
      .update({ hora_salida: hora })
      .eq("id", registro.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, registro: data });
  } catch (err) {
    console.error("Error marcar salida:", err);
    return NextResponse.json({ success: false, error: "Error al registrar salida" }, { status: 500 });
  }
}