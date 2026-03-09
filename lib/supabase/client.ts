// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

// Cliente público (para client-side si lo necesitas después)
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// Cliente server-side (usa service_role para bypass RLS si es necesario, o publishable si tienes políticas)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // ← clave secreta
);