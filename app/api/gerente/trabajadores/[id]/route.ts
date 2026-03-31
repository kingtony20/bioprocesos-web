import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

function pareceHashBcrypt(valor: string) {
  return typeof valor === "string" && /^\$2[aby]\$\d{2}\$/.test(valor);
}

function parseId(param: string) {
  const n = Number(param);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const trabajadorId = parseId(id);
    if (!trabajadorId) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("trabajadores")
      .select("id,dni,nombre,apellido,cargo,area,email,telefono,fecha_ingreso,activo,foto_url")
      .eq("id", trabajadorId)
      .maybeSingle();

    if (error) {
      console.error("Error al obtener trabajador:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ success: false, error: "Trabajador no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, trabajador: data });
  } catch (err) {
    console.error("Excepción en GET /api/gerente/trabajadores/[id]:", err);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const trabajadorId = parseId(id);
    if (!trabajadorId) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const patch: Record<string, unknown> = {};

    const allow = [
      "dni",
      "nombre",
      "apellido",
      "cargo",
      "area",
      "email",
      "telefono",
      "fecha_ingreso",
      "foto_url",
      "activo",
    ] as const;

    for (const key of allow) {
      if (key in body) patch[key] = body[key];
    }

    if ("password" in body) {
      const passwordRaw = (body?.password ?? "").toString();
      if (!passwordRaw.trim()) {
        return NextResponse.json({ success: false, error: "Password inválido" }, { status: 400 });
      }
      patch.password = pareceHashBcrypt(passwordRaw)
        ? passwordRaw
        : await bcrypt.hash(passwordRaw.trim(), 10);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: "No hay campos para actualizar" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("trabajadores")
      .update(patch)
      .eq("id", trabajadorId)
      .select("id,dni,nombre,apellido,cargo,area,email,telefono,fecha_ingreso,activo,foto_url")
      .single();

    if (error) {
      console.error("Error al actualizar trabajador:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, trabajador: data });
  } catch (err) {
    console.error("Excepción en PATCH /api/gerente/trabajadores/[id]:", err);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

