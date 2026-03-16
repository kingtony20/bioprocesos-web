// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {

    let { usuario, password } = await request.json();

    usuario = usuario.trim();
    password = password.trim();

    if (!usuario || !password) {
      return NextResponse.json(
        { success: false, error: 'Faltan usuario o contraseña' },
        { status: 400 }
      );
    }

    // 🔎 buscar usuario por DNI
    const { data, error } = await supabaseServer
      .from('trabajadores')
      .select('*')
      .eq('dni', usuario)
      .maybeSingle();

    if (error) {
      console.error("Error Supabase:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // ❌ usuario no existe
    if (!data) {
      return NextResponse.json({
        success: false,
        error: "Usuario no existe"
      });
    }

    // ❌ contraseña incorrecta
    if (data.password !== password) {
      return NextResponse.json({
        success: false,
        error: "Contraseña incorrecta"
      });
    }

    // ✅ login correcto
    return NextResponse.json({
      success: true,
      usuario: data
    });

  } catch (err) {

    console.error("Error login:", err);

    return NextResponse.json(
      { success: false, error: "Error en servidor" },
      { status: 500 }
    );

  }
}