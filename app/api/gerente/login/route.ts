import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

function pareceHashBcrypt(valor: string) {
  // Hash bcrypt típico: $2a$10$..., $2b$..., $2y$...
  return typeof valor === "string" && /^\$2[aby]\$\d{2}\$/.test(valor);
}

export async function POST(request: NextRequest) {
  try {
    let { usuario, email, password } = await request.json();

    const emailIngresado = (email ?? usuario)?.trim();
    password = password?.trim();

    if (!emailIngresado || !password) {
      return NextResponse.json(
        { success: false, error: "Faltan usuario o contraseña" },
        { status: 400 }
      );
    }

    // En tu tabla `gerentes`, el usuario es el email.
    const { data, error } = await supabaseServer
      .from("gerentes")
      .select("id, email, nombre, activo, created_at, password")
      .eq("email", emailIngresado)
      .maybeSingle();

    if (error) {
      console.error("Error al consultar gerente:", error.message);
      return NextResponse.json(
        { success: false, error: "Error al validar credenciales" },
        { status: 500 }
      );
    }

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

    const { password: _, ...gerenteSeguro } = data;

    return NextResponse.json({
      success: true,
      gerente: gerenteSeguro,
    });
  } catch (err) {
    console.error("Error en login gerente:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
