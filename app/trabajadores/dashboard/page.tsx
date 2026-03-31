"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Evento = {
  id: number;
  tipo: string;
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion?: string;
  color?: string;
};

export default function DashboardTrabajador() {
  const router = useRouter();

  const [fechaDisplay, setFechaDisplay] = useState("Cargando...");
  const [horaDisplay, setHoraDisplay] = useState("— : — —");
  const [registros, setRegistros] = useState<Record<string, { ingreso?: string; salida?: string }>>({});
  const [eventos, setEventos] = useState<Evento[]>([]);   // ← Nuevo
  const [iniciales, setIniciales] = useState("??");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Zona horaria y locale
  const TIMEZONE_PERU = "America/Lima";
  const LOCALE = "es-PE";
  const hoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_PERU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  // Protección de ruta
  useEffect(() => {
    if (!localStorage.getItem("usuario")) {
      router.push("/trabajadores");
      return;
    }

    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      const nombre = (usuario?.nombre ?? "").toString();
      const apellido = (usuario?.apellido ?? "").toString();

      const primeraLetra = (valor: string) => {
        const t = valor.trim();
        return t ? t[0] : "";
      };

      const inicialNombre = primeraLetra(nombre);
      const inicialApellido = primeraLetra(apellido);

      const inicialesCalculadas = `${inicialNombre}${inicialApellido}`.toUpperCase();
      setIniciales(inicialesCalculadas || "??");
    } catch {
      setIniciales("??");
    }
  }, [router]);

  // Cargar asistencias al montar
  useEffect(() => {
    const cargarAsistencias = async () => {
      const usuarioStr = localStorage.getItem("usuario");
      if (!usuarioStr) return;

      const usuario = JSON.parse(usuarioStr);
      if (!usuario?.id) return;

      try {
        const res = await fetch(`/api/trabajadores/asistencias?trabajador_id=${usuario.id}`);
        const data = await res.json();

        if (data.success) {
          const registrosFormateados: Record<string, { ingreso?: string; salida?: string }> = {};

          data.asistencias.forEach((a: any) => {
            registrosFormateados[a.fecha] = {
              ingreso: a.hora_ingreso,
              salida: a.hora_salida,
            };
          });

          setRegistros(registrosFormateados);
        }
      } catch (err) {
        console.error("Error al cargar asistencias:", err);
      }
    };

    cargarAsistencias();
  }, []);

  // ←←← NUEVO: Cargar eventos del gerente
  useEffect(() => {
    const cargarEventos = async () => {
      const usuarioStr = localStorage.getItem("usuario");
      if (!usuarioStr) return;

      const usuario = JSON.parse(usuarioStr);
      if (!usuario?.id) return;

      try {
        const res = await fetch(`/api/trabajadores/eventos?trabajador_id=${usuario.id}`);
        const data = await res.json();

        if (data.success) {
          setEventos(data.eventos || []);
        }
      } catch (err) {
        console.error("Error al cargar eventos:", err);
      }
    };

    cargarEventos();
  }, []);

  // Reloj en tiempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setFechaDisplay(
        now.toLocaleDateString(LOCALE, {
          weekday: "long",
          day: "numeric",
          month: "long",
          timeZone: TIMEZONE_PERU,
        })
      );

      setHoraDisplay(
        now.toLocaleTimeString(LOCALE, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: TIMEZONE_PERU,
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast auto-desaparece
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const marcarIngreso = async () => {
    if (registros[hoy]?.ingreso) return;

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    if (!usuario.id) return;

    try {
      const res = await fetch("/api/trabajadores/marcar-ingreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trabajador_id: usuario.id }),
      });

      const data = await res.json();

      if (data.success) {
        const { fecha, hora_ingreso } = data.registro;
        setRegistros((prev) => ({
          ...prev,
          [fecha]: { ...(prev[fecha] || {}), ingreso: hora_ingreso },
        }));
        setToast({ message: "¡Ingreso registrado correctamente! 🌅", type: "success" });
      } else {
        setToast({
          message: data.error || "No pudimos registrar el ingreso. Inténtalo de nuevo.",
          type: "error",
        });
      }
    } catch (err) {
      setToast({
        message: "Problema de conexión. Verifica tu internet e inténtalo otra vez.",
        type: "error",
      });
    }
  };

  const marcarSalida = async () => {
    if (registros[hoy]?.salida) return;
    if (!registros[hoy]?.ingreso) {
      setToast({ message: "Primero debes marcar el ingreso del día", type: "error" });
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    if (!usuario.id) return;

    try {
      const res = await fetch("/api/trabajadores/marcar-salida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trabajador_id: usuario.id }),
      });

      const data = await res.json();

      if (data.success) {
        const { fecha, hora_salida } = data.registro;
        setRegistros((prev) => ({
          ...prev,
          [fecha]: { ...(prev[fecha] || {}), salida: hora_salida },
        }));
        setToast({ message: "¡Salida registrada! Buen trabajo hoy 👏", type: "success" });
      } else {
        setToast({
          message: data.error || "Hubo un problema al registrar la salida.",
          type: "error",
        });
      }
    } catch (err) {
      setToast({
        message: "Problema de conexión. Verifica tu internet e inténtalo otra vez.",
        type: "error",
      });
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    router.push("/trabajadores");
  };

  // ── Calendario ────────────────────────────────────────────────────────

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const meses = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleDateString(LOCALE, { month: "long" }),
  }));

  const años = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const primerDia = new Date(currentYear, currentMonth - 1, 1);
  const diasEnMes = new Date(currentYear, currentMonth, 0).getDate();
  const diaSemanaInicio = ((primerDia.getDay() + 6) % 7) + 1; // lunes = 1
  const dias = Array.from({ length: diasEnMes }, (_, i) => i + 1);
  const celdasVaciasInicio = Array(diaSemanaInicio - 1).fill(null);

  const calendarTitle = new Date(currentYear, currentMonth - 1, 1).toLocaleDateString(LOCALE, {
    month: "long",
    year: "numeric",
  }).toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6 md:p-10">
      {/* Header */}
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <img src="/img/logo.png" alt="Logo" className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Bio Procesos Industriales</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="rounded-full bg-white/95 backdrop-blur-sm px-5 py-2.5 shadow-sm text-gray-700 font-medium">
            {fechaDisplay} — {horaDisplay}
          </div>

          <button
            onClick={cerrarSesion}
            className="rounded-xl bg-red-500 px-4 py-2 text-white font-semibold shadow hover:bg-red-600"
          >
            Cerrar sesión
          </button>

          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            {iniciales}
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm">
          <div
            className={`rounded-xl px-6 py-4 shadow-2xl text-white font-medium flex items-center gap-3 ${toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
              }`}
          >
            {toast.type === "success" ? "✅" : "⚠️"}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Registro de horas */}
      <section className="mb-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white/80 backdrop-blur-md p-6 shadow-xl border border-gray-200/50">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Registro de Ingreso</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 rounded-lg bg-gray-50 px-5 py-3 text-center font-mono text-lg text-slate-900 min-w-[140px]">
              {registros[hoy]?.ingreso || "— — : — —"}
            </div>
            <button
              onClick={marcarIngreso}
              disabled={!!registros[hoy]?.ingreso}
              className={`rounded-xl px-8 py-3 font-semibold text-white shadow-lg transition-all ${registros[hoy]?.ingreso
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 hover:shadow-xl active:scale-100"
                }`}
            >
              {registros[hoy]?.ingreso ? "INGRESO YA MARCADO" : "MARCAR INGRESO"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 backdrop-blur-md p-6 shadow-xl border border-gray-200/50">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Registro de Salida</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 rounded-lg bg-gray-50 px-5 py-3 text-center font-mono text-lg text-slate-900 min-w-[140px]">
              {registros[hoy]?.salida || "— — : — —"}
            </div>
            <button
              onClick={marcarSalida}
              disabled={!!registros[hoy]?.salida}
              className={`rounded-xl px-8 py-3 font-semibold text-white shadow-lg transition-all ${registros[hoy]?.salida
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : "bg-gradient-to-r from-red-500 to-rose-600 hover:scale-105 hover:shadow-xl active:scale-100"
                }`}
            >
              {registros[hoy]?.salida ? "SALIDA YA MARCADA" : "MARCAR SALIDA"}
            </button>
          </div>
        </div>
      </section>

      {/* Calendario – solo datos reales */}
      <section className="rounded-3xl bg-white/70 backdrop-blur-md p-6 md:p-8 shadow-2xl border border-gray-200/50">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{calendarTitle}</h2>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={prevMonth}
              className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
            >
              ← Anterior
            </button>

            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="rounded-lg bg-white px-4 py-2 border border-gray-300 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {meses.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label.charAt(0).toUpperCase() + mes.label.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="rounded-lg bg-white px-4 py-2 border border-gray-300 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {años.map((año) => (
                <option key={año} value={año}>
                  {año}
                </option>
              ))}
            </select>

            <button
              onClick={nextMonth}
              className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
            >
              Siguiente →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((dia) => (
            <div key={dia} className="py-3">
              {dia}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {celdasVaciasInicio.map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] rounded-xl" />
          ))}

          {dias.map((dia) => {
            const fechaKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
            const registro = registros[fechaKey];

            // Eventos del día
            const eventosDelDia = eventos.filter((e) => {
              const inicio = e.fecha_inicio;
              const fin = e.fecha_fin || e.fecha_inicio;
              return fechaKey >= inicio && fechaKey <= fin;
            });

            // Color de fondo según estado
            let bgClass = "bg-white border border-gray-200 hover:border-gray-300";
            if (registro?.ingreso && registro?.salida) {
              bgClass = "bg-emerald-50 border-emerald-200";
            } else if (registro?.ingreso) {
              bgClass = "bg-green-50 border-green-200";
            }

            return (
              <div
                key={dia}
                className={`
        min-h-[118px] rounded-2xl p-3 text-left shadow-sm transition-all
        flex flex-col ${bgClass}
        ${selectedDay === dia ? "ring-2 ring-blue-400 scale-[1.02]" : ""}
      `}
              >
                {/* Número del día */}
                <div className="font-semibold text-lg text-gray-800 mb-2">
                  {dia}
                </div>

                {/* Marcaciones */}
                <div className="space-y-1.5 flex-1">
                  {registro?.ingreso && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600 text-base">🟢</span>
                      <span className="font-medium text-green-700">{registro.ingreso}</span>
                    </div>
                  )}
                  {registro?.salida && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-red-600 text-base">🔴</span>
                      <span className="font-medium text-red-700">{registro.salida}</span>
                    </div>
                  )}
                </div>

                {/* Eventos del Gerente */}
                {eventosDelDia.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {eventosDelDia.slice(0, 2).map((e, idx) => (   // máximo 2 eventos por celda
                      <div
                        key={idx}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg text-white flex items-center gap-1.5 truncate"
                        style={{ backgroundColor: e.color || "#6366f1" }}
                      >
                        <span className="opacity-90">•</span>
                        {e.tipo}
                      </div>
                    ))}
                    {eventosDelDia.length > 2 && (
                      <div className="text-[10px] text-gray-500 text-center">
                        +{eventosDelDia.length - 2} más
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}