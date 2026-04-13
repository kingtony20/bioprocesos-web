import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

function pareceHashBcrypt(valor: string) {
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

    // 🔹 Buscar gerente en SQLite
    const gerente = db.prepare(`
      SELECT id, email, nombre, activo, created_at, password
      FROM gerentes
      WHERE email = ?
    `).get(emailIngresado);

    // ❌ No existe
    if (!gerente) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    // ❌ Inactivo (SQLite usa 0/1)
    if (gerente.activo === 0) {
      return NextResponse.json(
        { success: false, error: "Usuario inactivo" },
        { status: 401 }
      );
    }

    // 🔐 Validar contraseña
    const passwordBD = gerente.password ?? "";

    const passwordCorrecta = pareceHashBcrypt(passwordBD)
      ? await bcrypt.compare(password, passwordBD)
      : password === passwordBD;

    if (!passwordCorrecta) {
      return NextResponse.json(
        { success: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // 🔹 Quitar password antes de devolver
    const { password: _, ...gerenteSeguro } = gerente;

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