import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

function pareceHashBcrypt(valor: string) {
  // Hash bcrypt típico: $2a$10$...
  return typeof valor === "string" && /^\$2[aby]\$\d{2}\$/.test(valor);
}

export async function POST(request: NextRequest) {
  try {
    let { usuario, password } = await request.json();

    usuario = usuario?.trim();
    password = password?.trim();

    if (!usuario || !password) {
      return NextResponse.json(
        { success: false, error: "Faltan usuario o contraseña" },
        { status: 400 }
      );
    }

    // Buscar usuario por DNI (solo los campos necesarios)
    const { data, error } = await supabaseServer
      .from("trabajadores")
      .select("id, dni, nombre, apellido, cargo, area, activo, password")
      .eq("dni", usuario)
      .maybeSingle();

    if (error) {
      console.error("Error al consultar trabajador:", error.message);
      return NextResponse.json(
        { success: false, error: "Error al validar credenciales" },
        { status: 500 }
      );
    }

    // Usuario no existe
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    if (data.activo === false) {
      return NextResponse.json(
        { success: false, error: "Usuario inactivo" },
        { status: 401 }
      );
    }

    // Compatibilidad: si la contraseña en BD está hasheada, usamos bcrypt.
    // Si está en texto plano (común al inicio), comparamos directo.
    const passwordBD = data.password ?? "";
    const passwordCorrecta = pareceHashBcrypt(passwordBD)
      ? await bcrypt.compare(password, passwordBD)
      : password === passwordBD;

    if (!passwordCorrecta) {
      return NextResponse.json(
        { success: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Eliminar el campo password del objeto que se devuelve
    const { password: _, ...usuarioSeguro } = data;

    // Login exitoso - devolvemos datos sin contraseña
    return NextResponse.json({
      success: true,
      usuario: usuarioSeguro
    });

  } catch (err) {
    console.error("Error en login:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}