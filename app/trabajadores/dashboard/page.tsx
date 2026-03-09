"use client";

import { useState, useEffect } from "react";

export default function DashboardTrabajador() {
  const [horaIngreso, setHoraIngreso] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [fechaDisplay, setFechaDisplay] = useState("Cargando...");
  const [horaDisplay, setHoraDisplay] = useState("— : — —");
  const [mesAnoDisplay, setMesAnoDisplay] = useState("CARGANDO...");
  const [registros, setRegistros] = useState<Record<string, { ingreso?: string; salida?: string }>>({});

  // Zona horaria fija para Perú
  const TIMEZONE_PERU = "America/Lima";
  const LOCALE = "es-PE";

  // Estado para navegación del calendario
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // Para resaltar día específico

  // Datos de ejemplo (actualizados a 2026 como en tu código)
  const eventosEjemplo: Record<string, { title: string; color: string; emoji?: string }> = {
    "2026-02-07": { title: "Kick off de trimestre", color: "bg-green-400/90", emoji: "🚀" },
    "2026-02-09": { title: "Reunión con MX", color: "bg-orange-400/90", emoji: "🟠" },
    "2026-02-12": { title: "Viaje a HQ", color: "bg-blue-400/90", emoji: "✈️" },
    "2026-02-13": { title: "Viaje a HQ", color: "bg-blue-400/90", emoji: "✈️" },
    "2026-02-17": { title: "Cena de equipo", color: "bg-amber-400/90", emoji: "🍽️" },
    "2026-02-18": { title: "Cita neurólogo", color: "bg-purple-400/90", emoji: "🧠" },
    "2026-02-22": { title: "Entrevistas con candidatas", color: "bg-yellow-300/90", emoji: "👩‍💼" },
    "2026-02-23": { title: "Entrevistas con candidatas", color: "bg-yellow-300/90", emoji: "👩‍💼" },
    "2026-02-24": { title: "Reunión para contrataciones", color: "bg-emerald-400/90", emoji: "🤝" },
    "2026-02-27": { title: "Preparar reporte", color: "bg-gray-700 text-white", emoji: "📊" },
    "2026-03-03": { title: "Vacaciones", color: "bg-teal-400/90", emoji: "🏖️" },
    "2026-03-04": { title: "Vacaciones", color: "bg-teal-400/90", emoji: "🏖️" },
    "2026-03-05": { title: "Vacaciones", color: "bg-teal-400/90", emoji: "🏖️" },
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Fecha completa (ej: "domingo 9 de marzo")
      setFechaDisplay(
        now.toLocaleDateString(LOCALE, {
          weekday: "long",
          day: "numeric",
          month: "long",
          timeZone: TIMEZONE_PERU,
        })
      );

      // Hora actual en formato 24h (puedes cambiar a hour12: true para 12h)
      setHoraDisplay(
        now.toLocaleTimeString(LOCALE, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: TIMEZONE_PERU,
        })
      );

      // Mes y año para el título del calendario (ej: "MARZO 2026")
      setMesAnoDisplay(
        now.toLocaleDateString(LOCALE, {
          month: "long",
          year: "numeric",
          timeZone: TIMEZONE_PERU,
        }).toUpperCase()
      );
    };

    updateTime(); // Ejecutar inmediatamente
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  const marcarIngreso = () => {
    const now = new Date();
    const hora = now.toLocaleTimeString(LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TIMEZONE_PERU,
    });
    const fecha = now.toLocaleDateString(LOCALE, { timeZone: TIMEZONE_PERU });

    setHoraIngreso(hora);
    setRegistros((prev) => ({
      ...prev,
      [fecha]: { ...prev[fecha], ingreso: hora },
    }));
  };

  const marcarSalida = () => {
    const now = new Date();
    const hora = now.toLocaleTimeString(LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TIMEZONE_PERU,
    });
    const fecha = now.toLocaleDateString(LOCALE, { timeZone: TIMEZONE_PERU });

    setHoraSalida(hora);
    setRegistros((prev) => ({
      ...prev,
      [fecha]: { ...prev[fecha], salida: hora },
    }));
  };

  // Funciones de navegación
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

  // Generar meses y años para selects
  const meses = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleDateString(LOCALE, { month: "long" }),
  }));

  const años = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i); // ±10 años alrededor del actual

  // Generar días del mes seleccionado
  const primerDia = new Date(currentYear, currentMonth - 1, 1);
  const diasEnMes = new Date(currentYear, currentMonth, 0).getDate();
  const diaSemanaInicio = (primerDia.getDay() + 6) % 7 + 1; // Ajuste para Lun-Dom (1=Lun, 7=Dom)
  const dias = Array.from({ length: diasEnMes }, (_, i) => i + 1);
  const celdasVaciasInicio = Array(diaSemanaInicio - 1).fill(null);

  // Actualizar título del calendario basado en selección
  const calendarTitle = new Date(currentYear, currentMonth - 1, 1).toLocaleDateString(LOCALE, {
    month: "long",
    year: "numeric",
  }).toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6 md:p-10">
      {/* Header moderno */}
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

          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            AJ
          </div>
        </div>
      </header>

      {/* Sección de Registro de Horas */}
      <section className="mb-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white/80 backdrop-blur-md p-6 shadow-xl border border-gray-200/50 transition-all hover:shadow-2xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Registro de Ingreso</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 rounded-lg bg-gray-50 px-5 py-3 text-center font-mono text-lg text-slate-900">
              {horaIngreso || "— — : — —"}
            </div>
            <button
              onClick={marcarIngreso}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-100"
            >
              MARCAR INGRESO
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 backdrop-blur-md p-6 shadow-xl border border-gray-200/50 transition-all hover:shadow-2xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Registro de Salida</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 rounded-lg bg-gray-50 px-5 py-3 text-center font-mono text-lg text-slate-900">
              {horaSalida || "— — : — —"}
            </div>
            <button
              onClick={marcarSalida}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-100"
            >
              MARCAR SALIDA
            </button>
          </div>
        </div>
      </section>

      {/* Calendario con navegación y filtros */}
      <section className="rounded-3xl bg-white/70 backdrop-blur-md p-6 md:p-8 shadow-2xl border border-gray-200/50">
        {/* Controles de navegación y filtros */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{calendarTitle}</h2>

          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
            >
              &lt; Anterior
            </button>

            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="rounded-lg bg-white px-4 py-2 border border-gray-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="rounded-lg bg-white px-4 py-2 border border-gray-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              Siguiente &gt;
            </button>
          </div>

          {/* Filtro por día específico (resalta el día) */}
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700">Buscar día:</label>
            <input
              type="number"
              min={1}
              max={diasEnMes}
              value={selectedDay || ""}
              onChange={(e) => setSelectedDay(Number(e.target.value) || null)}
              className="w-20 rounded-lg bg-white px-3 py-2 border border-gray-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Día"
            />
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
            const evento = eventosEjemplo[fechaKey];
            const isSelected = selectedDay === dia;

            return (
              <div
                key={dia}
                className={`group relative min-h-[100px] rounded-2xl p-3 text-left text-sm transition-all hover:scale-[1.03] hover:shadow-xl ${evento ? evento.color : "bg-gray-50/70 border border-gray-200"
                  } shadow-sm ${isSelected ? "ring-4 ring-blue-500" : ""}`}
              >
                <div className="font-bold text-gray-800">{dia}</div>

                {registro && (
                  <div className="mt-1 text-xs">
                    {registro.ingreso && <div className="text-green-700">🟢 {registro.ingreso}</div>}
                    {registro.salida && <div className="text-red-700">🔴 {registro.salida}</div>}
                  </div>
                )}

                {evento && (
                  <div className="mt-2 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-medium shadow-inner border border-gray-200 text-slate-950">
                    {evento.emoji} {evento.title}
                  </div>
                )}

                {evento && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-lg font-bold text-white drop-shadow-md">{evento.title}</span>
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