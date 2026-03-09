// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';  // ajusta la ruta si no usas @/

export async function POST(request: NextRequest) {
  try {
    const { usuario, password } = await request.json();

    if (!usuario || !password) {
      return NextResponse.json(
        { success: false, error: 'Faltan usuario o contraseña' },
        { status: 400 }
      );
    }

    // Tu query actual (adaptada a Supabase client)
    const { data, error } = await supabase
      .from('trabajadores')
      .select('*')
      .eq('dni', usuario)           // asumiendo que "usuario" es el DNI
      .eq('password', password)     // ¡OJO! Nunca guardes passwords en plano – usa hashing
      .single();                    // .single() en vez de LIMIT 1

    if (error) {
      console.error('Error en Supabase:', error);
      return NextResponse.json(
        { success: false, error: 'Error en servidor' },
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