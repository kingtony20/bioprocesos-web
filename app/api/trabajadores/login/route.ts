import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

function pareceHashBcrypt(valor: string) {
  return typeof valor === "string" && /^\$2[aby]\$\d{2}\$/.test(valor);
}

export async function POST(request: NextRequest) {
  try {
    let { usuario, password } = await request.json();

    usuario = usuario?.trim();
    password = password?.trim();

    if (!usuario || !password) {
      return NextResponse.json(
        { success: false, error: "Faltan credenciales" },
        { status: 400 }
      );
    }

    const data = db.prepare(`
      SELECT id, dni, nombre, apellido, cargo, area, activo, password
      FROM trabajadores
      WHERE dni = ?
    `).get(usuario);

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    if (data.activo === 0) {
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

    const { password: _, ...usuarioSeguro } = data;

    return NextResponse.json({
      success: true,
      usuario: usuarioSeguro
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}