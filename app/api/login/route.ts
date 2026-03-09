// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/client';  // ← usa el server client

export async function POST(request: NextRequest) {
  try {
    const { usuario, password } = await request.json();

    if (!usuario || !password) {
      return NextResponse.json(
        { success: false, error: 'Faltan usuario o contraseña' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('trabajadores')
      .select('*')
      .eq('dni', usuario)
      .eq('password', password)
      .single();

    if (error) {
      console.error('Error en Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Error en servidor' },
        { status: 500 }
      );
    }

    if (data) {
      return NextResponse.json({
        success: true,
        usuario: data,
      });
    } else {
      return NextResponse.json({
        success: false,
      });
    }
  } catch (err) {
    console.error('Error en /api/login:', err);
    return NextResponse.json(
      { error: 'Error en servidor' },
      { status: 500 }
    );
  }
}