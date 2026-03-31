import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

function pareceHashBcrypt(valor: string) {
  return typeof valor === "string" && /^\$2[aby]\$\d{2}\$/.test(valor);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = (searchParams.get("estado") || "activo").toLowerCase();
    const search = (searchParams.get("search") || "").trim();

    let query = supabaseServer
      .from("trabajadores")
      .select("id,dni,nombre,apellido,cargo,area,email,telefono,fecha_ingreso,activo,foto_url")
      .order("nombre", { ascending: true });

    if (estado === "activo") query = query.eq("activo", true);
    if (estado === "inactivo") query = query.eq("activo", false);
    // estado === "todos" -> sin filtro

    if (search) {
      // Nota: OR en Supabase usa sintaxis: or('col.ilike.%x%,col2.ilike.%x%')
      // dni es varchar, nombre/apellido también.
      const s = search.replaceAll(",", " "); // evitar romper la query OR
      query = query.or(`dni.ilike.%${s}%,nombre.ilike.%${s}%,apellido.ilike.%${s}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error al listar trabajadores:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, trabajadores: data || [] });
  } catch (err) {
    console.error("Excepción en GET /api/gerente/trabajadores:", err);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dni = (body?.dni ?? "").toString().trim();
    const nombre = (body?.nombre ?? "").toString().trim();
    const apellido = (body?.apellido ?? "").toString().trim();
    const passwordRaw = (body?.password ?? "").toString();

    if (!dni || !nombre || !apellido || !passwordRaw) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios: dni, nombre, apellido, password" },
        { status: 400 }
      );
    }

    const password = pareceHashBcrypt(passwordRaw)
      ? passwordRaw
      : await bcrypt.hash(passwordRaw.trim(), 10);

    const payload = {
      dni,
      nombre,
      apellido,
      password,
      cargo: body?.cargo ?? null,
      area: body?.area ?? null,
      email: body?.email ?? null,
      telefono: body?.telefono ?? null,
      fecha_ingreso: body?.fecha_ingreso ?? null,
      foto_url: body?.foto_url ?? null,
      activo: body?.activo ?? true,
    };

    const { data, error } = await supabaseServer
      .from("trabajadores")
      .insert(payload)
      .select("id,dni,nombre,apellido,cargo,area,email,telefono,fecha_ingreso,activo,foto_url")
      .single();

    if (error) {
      console.error("Error al crear trabajador:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, trabajador: data });
  } catch (err) {
    console.error("Excepción en POST /api/gerente/trabajadores:", err);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

