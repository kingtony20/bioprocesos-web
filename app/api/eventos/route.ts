import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

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
      todo_el_dia = false,
      color,
    } = body;

    // Validaciones mínimas
    if (!trabajador_id || !tipo || !fecha_inicio) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios: trabajador_id, tipo, fecha_inicio" },
        { status: 400 }
      );
    }

    // Obtener id del gerente (si usas autenticación por localStorage o token)
    const gerenteStr = request.headers.get("x-gerente") || localStorage.getItem("gerente"); // ← adapta según tu auth
    let gerente_id = null;
    if (gerenteStr) {
      try {
        gerente_id = JSON.parse(gerenteStr)?.id;
      } catch {}
    }

    const { data, error } = await supabaseServer
      .from("eventos")
      .insert({
        trabajador_id,
        gerente_id,
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


// Agrega este handler al mismo archivo (route.ts) si usas App Router con múltiples métodos

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const trabajador_id = searchParams.get("trabajador_id");
    const desde = searchParams.get("desde"); // YYYY-MM-DD
    const hasta = searchParams.get("hasta");
  
    let query = supabaseServer.from("eventos").select("*");
  
    if (trabajador_id) {
      query = query.eq("trabajador_id", trabajador_id);
    }
  
    if (desde) {
      query = query.gte("fecha_inicio", desde);
    }
  
    if (hasta) {
      query = query.lte("fecha_inicio", hasta);
    }
  
    const { data, error } = await query.order("fecha_inicio", { ascending: true });
  
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  
    return NextResponse.json({ success: true, eventos: data || [] });
  }