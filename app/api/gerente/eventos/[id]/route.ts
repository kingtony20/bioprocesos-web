import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";

function parseId(param: string) {
  const n = Number(param);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const eventoId = parseId(id);
    if (!eventoId) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const patch: Record<string, unknown> = {};
    const allow = [
      "tipo",
      "fecha_inicio",
      "fecha_fin",
      "hora_inicio",
      "hora_fin",
      "todo_el_dia",
      "descripcion",
      "color",
    ] as const;

    for (const key of allow) {
      if (key in body) patch[key] = body[key];
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: "No hay campos para actualizar" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("eventos")
      .update(patch)
      .eq("id", eventoId)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar evento:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, evento: data });
  } catch (err) {
    console.error("Excepción en PATCH /api/gerente/eventos/[id]:", err);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const eventoId = parseId(id);
    if (!eventoId) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const { error } = await supabaseServer.from("eventos").delete().eq("id", eventoId);

    if (error) {
      console.error("Error al eliminar evento:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Excepción en DELETE /api/gerente/eventos/[id]:", err);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

