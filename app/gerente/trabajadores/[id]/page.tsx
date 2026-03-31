"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import styles from "./calendar.module.css";

type Toast = { msg: string; type: "success" | "error" } | null;

const TIPOS_EVENTO = [
  "Vacaciones",
  "Reunion",
  "Capacitacion",
  "Permiso",
  "Licencia",
  "Evaluacion",
  "Incidencia",
  "Comunicacion",
  "Otro",
] as const;

function formatDatePeru(fecha: string) {
  if (!fecha) return "—";
  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
}

function isoDatePeru(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function betweenInclusive(fecha: string, desde: string, hasta: string) {
  return fecha >= desde && fecha <= hasta;
}

export default function DetalleTrabajador({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const trabajadorId = Number(id);

  const [tab, setTab] = useState<"asistencias" | "eventos">("asistencias");
  const [toast, setToast] = useState<Toast>(null);

  const [loading, setLoading] = useState(true);
  const [trabajador, setTrabajador] = useState<any>(null);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);

  const [mesActivo, setMesActivo] = useState(() => new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date>(() => new Date());

  // Filtros para historial de asistencias
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [modalEvento, setModalEvento] = useState(false);
  const [guardandoEvento, setGuardandoEvento] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    tipo: "reunion",
    fecha_inicio: isoDatePeru(new Date()),
    fecha_fin: "",
    todo_el_dia: true,
    hora_inicio: "",
    hora_fin: "",
    descripcion: "",
    color: "#a78bfa",
  });

  useEffect(() => {
    if (!localStorage.getItem("gerente")) router.push("/gerente/login");
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const cargarAsistencias = async (todas: boolean = false, desde?: string, hasta?: string) => {
    let url = `/api/gerente/asistencias?trabajador_id=${trabajadorId}`;

    if (!todas) {
      // Mes actual por defecto
      const hoy = new Date();
      const desdeMes = isoDatePeru(startOfMonth(hoy));
      const hastaMes = isoDatePeru(endOfMonth(hoy));
      url += `&desde=${desdeMes}&hasta=${hastaMes}`;
    } else if (desde && hasta) {
      url += `&desde=${desde}&hasta=${hasta}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Error cargando asistencias");

    setAsistencias(data.asistencias || []);
  };

  const cargarEventosMes = async (base: Date) => {
    const desde = isoDatePeru(startOfMonth(base));
    const hasta = isoDatePeru(endOfMonth(base));

    const res = await fetch(
      `/api/gerente/eventos?trabajador_id=${trabajadorId}&desde=${desde}&hasta=${hasta}`
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "No se pudo cargar eventos");
    setEventos(data.eventos || []);
  };

  const cargarTodo = async () => {
    try {
      setLoading(true);

      const tRes = await fetch(`/api/gerente/trabajadores/${trabajadorId}`);
      const tData = await tRes.json();

      if (!tData.success) throw new Error(tData.error || "No se pudo cargar trabajador");

      setTrabajador(tData.trabajador);

      await Promise.all([
        cargarAsistencias(false),           // Carga mes actual por defecto
        cargarEventosMes(mesActivo)
      ]);
    } catch {
      setToast({ msg: "Error cargando detalle", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(trabajadorId) || trabajadorId <= 0) {
      router.push("/gerente/dashboard");
      return;
    }
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trabajadorId]);

  // Asistencias filtradas
  const asistenciasFiltradas = useMemo(() => {
    let filtradas = [...asistencias];

    if (fechaDesde && fechaHasta) {
      filtradas = filtradas.filter(a =>
        a.fecha >= fechaDesde && a.fecha <= fechaHasta
      );
    }

    return filtradas.sort((a, b) => b.fecha.localeCompare(a.fecha)); // Más recientes primero
  }, [asistencias, fechaDesde, fechaHasta]);

  const eventosDelDia = useMemo(() => {
    const dia = isoDatePeru(diaSeleccionado);
    return eventos.filter((e) => {
      const inicio = e.fecha_inicio;
      const fin = e.fecha_fin || e.fecha_inicio;
      return betweenInclusive(dia, inicio, fin);
    });
  }, [eventos, diaSeleccionado]);

  const initials = useMemo(() => {
    const n = (trabajador?.nombre ?? "").toString().trim();
    const a = (trabajador?.apellido ?? "").toString().trim();
    const i1 = n ? n[0] : "";
    const i2 = a ? a[0] : "";
    return (i1 + i2).toUpperCase() || "??";
  }, [trabajador]);

  const toggleActivo = async () => {
    try {
      const res = await fetch(`/api/gerente/trabajadores/${trabajadorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !trabajador.activo }),
      });
      const data = await res.json();
      if (!data.success) {
        setToast({ msg: data.error || "No se pudo actualizar estado", type: "error" });
        return;
      }
      setTrabajador(data.trabajador);
      setToast({ msg: `Trabajador ${data.trabajador.activo ? "activado" : "desactivado"}`, type: "success" });
    } catch {
      setToast({ msg: "Error de conexión", type: "error" });
    }
  };

  const crearEvento = async () => {
    try {
      setGuardandoEvento(true);
      const gerente = JSON.parse(localStorage.getItem("gerente") || "{}");

      const res = await fetch("/api/gerente/eventos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gerente-id": gerente?.id || "",
        },
        body: JSON.stringify({
          trabajador_id: trabajadorId,
          tipo: nuevoEvento.tipo,
          fecha_inicio: nuevoEvento.fecha_inicio,
          fecha_fin: nuevoEvento.fecha_fin || null,
          hora_inicio: nuevoEvento.todo_el_dia ? null : (nuevoEvento.hora_inicio || null),
          hora_fin: nuevoEvento.todo_el_dia ? null : (nuevoEvento.hora_fin || null),
          todo_el_dia: !!nuevoEvento.todo_el_dia,
          descripcion: nuevoEvento.descripcion || null,
          color: nuevoEvento.color || "#a78bfa",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setToast({ msg: data.error || "No se pudo crear el evento", type: "error" });
        return;
      }

      setToast({ msg: "Evento creado correctamente", type: "success" });
      setModalEvento(false);

      // ←←← RESETEAMOS Y RECARGAMOS TODO para asegurar que aparezca
      setNuevoEvento({
        tipo: "reunion",
        fecha_inicio: isoDatePeru(new Date()),
        fecha_fin: "",
        todo_el_dia: true,
        hora_inicio: "",
        hora_fin: "",
        descripcion: "",
        color: "#a78bfa",
      });

      // Recargamos eventos del mes actual + cambiamos a pestaña Eventos
      await cargarEventosMes(mesActivo);
      setTab("eventos");   // ← Esto ayuda a que se vea inmediatamente

    } catch (err) {
      console.error(err);
      setToast({ msg: "Error de conexión creando evento", type: "error" });
    } finally {
      setGuardandoEvento(false);
    }
  };

  const eliminarEvento = async (id: number) => {
    try {
      const res = await fetch(`/api/gerente/eventos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        setToast({ msg: data.error || "No se pudo eliminar", type: "error" });
        return;
      }
      setToast({ msg: "Evento eliminado", type: "success" });
      await cargarEventosMes(mesActivo);
    } catch {
      setToast({ msg: "Error de conexión eliminando evento", type: "error" });
    }
  };

  {loading && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4">
        
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
  
        {/* Texto */}
        <p className="text-gray-800 font-semibold">Cargando información...</p>
      
      </div>
  
    </div>
  )}

  if (!trabajador) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Trabajador no encontrado.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6 md:p-10">
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm">
          <div
            className={`rounded-xl px-6 py-4 shadow-2xl text-white font-medium flex items-center gap-3 ${toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
              }`}
          >
            <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/gerente/dashboard")}
            className="rounded-xl bg-white/90 px-4 py-2 font-semibold text-gray-700 shadow border border-gray-200 hover:bg-white"
          >
            ← Volver
          </button>

          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            {initials}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {trabajador.nombre} {trabajador.apellido}
            </h1>
            <p className="text-sm text-gray-600">
              DNI: {trabajador.dni} • {trabajador.cargo || "—"} • {trabajador.area || "—"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${trabajador.activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"
              }`}
          >
            {trabajador.activo ? "Activo" : "Inactivo"}
          </span>

          <button
            onClick={toggleActivo}
            className={`rounded-xl px-4 py-2 font-semibold text-white shadow ${trabajador.activo ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
          >
            {trabajador.activo ? "Desactivar" : "Activar"}
          </button>

          <button
            onClick={() => {
              setTab("eventos");
              setModalEvento(true);
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow hover:bg-indigo-700"
          >
            + Crear evento
          </button>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setTab("asistencias")}
          className={`rounded-lg px-4 py-2 font-semibold border ${tab === "asistencias"
            ? "bg-white text-gray-900 border-gray-300 shadow-sm"
            : "bg-transparent text-gray-600 border-gray-200 hover:bg-white/60"
            }`}
        >
          Asistencias
        </button>
        <button
          onClick={() => setTab("eventos")}
          className={`rounded-lg px-4 py-2 font-semibold border ${tab === "eventos"
            ? "bg-white text-gray-900 border-gray-300 shadow-sm"
            : "bg-transparent text-gray-600 border-gray-200 hover:bg-white/60"
            }`}
        >
          Eventos
        </button>
      </div>

      {tab === "asistencias" ? (
        <section className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Historial de marcación</h2>
              <p className="text-sm text-gray-600">Registros de ingreso y salida</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={async () => {
                  const nuevoEstado = !mostrarTodas;
                  setMostrarTodas(nuevoEstado);
                  setFechaDesde("");
                  setFechaHasta("");
                  await cargarAsistencias(nuevoEstado);
                }}
                className="rounded-xl px-4 py-2 font-semibold border border-gray-800 text-black hover:bg-gray-50"
              >
                {mostrarTodas ? "Ver solo mes actual" : "Ver todas las asistencias"}
              </button>

              {mostrarTodas && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  />
                  <span className="text-gray-900 text-sm">hasta</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="bg-white/90 sticky top-0">
                <tr className="text-gray-600">
                  <th className="px-6 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-6 py-3 text-left font-semibold">Ingreso</th>
                  <th className="px-6 py-3 text-left font-semibold">Salida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/70">
                {asistenciasFiltradas.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-900" colSpan={3}>
                      No hay asistencias registradas en el rango seleccionado.
                    </td>
                  </tr>
                ) : (
                  asistenciasFiltradas.map((a) => (
                    <tr key={a.id} className="hover:bg-white/60">
                      <td className="px-6 py-3 font-semibold text-gray-900">
                        {formatDatePeru(a.fecha)}
                      </td>
                      <td className="px-6 py-3 text-emerald-700 font-medium">{a.hora_ingreso || "—"}</td>
                      <td className="px-6 py-3 text-rose-700 font-medium">{a.hora_salida || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Calendario</h2>

            <Calendar
              className={styles.calendar}
              locale="es-PE"
              value={diaSeleccionado}
              onChange={(v) => setDiaSeleccionado(v as Date)}
              onActiveStartDateChange={({ activeStartDate }) => {
                const d = activeStartDate || new Date();
                setMesActivo(d);
                cargarEventosMes(d).catch(() => setToast({ msg: "Error cargando eventos", type: "error" }));
              }}
              tileContent={({ date, view }) => {
                if (view !== "month") return null;

                const diaStr = isoDatePeru(date);
                const tieneEvento = eventos.some((e) => {
                  const inicio = e.fecha_inicio;
                  const fin = e.fecha_fin || e.fecha_inicio;
                  return diaStr >= inicio && diaStr <= fin;
                });

                if (!tieneEvento) return null;

                return (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-indigo-600 rounded-full shadow-md ring-2 ring-white" />
                );
              }}
            />
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Eventos del día</h3>
              <button
                onClick={() => setModalEvento(true)}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-white font-semibold hover:bg-indigo-700"
              >
                + Crear
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{formatDatePeru(isoDatePeru(diaSeleccionado))}</p>

            <div className="space-y-3">
              {eventosDelDia.length === 0 ? (
                <div className="text-sm text-gray-600">Sin eventos para este día.</div>
              ) : (
                eventosDelDia.map((e) => (
                  <div key={e.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ background: e.color || "#a78bfa" }}
                          />
                          <p className="font-bold text-gray-900">{e.tipo}</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {e.todo_el_dia
                            ? "Todo el día"
                            : `${e.hora_inicio || "—"} a ${e.hora_fin || "—"}`}
                        </p>
                        {e.descripcion && <p className="text-sm text-gray-700 mt-2">{e.descripcion}</p>}
                      </div>

                      <button
                        onClick={() => eliminarEvento(e.id)}
                        className="rounded-lg bg-rose-600 px-3 py-2 text-white font-semibold hover:bg-rose-700"
                      >
                        Eliminar
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {formatDatePeru(e.fecha_inicio)}
                      {e.fecha_fin ? ` → ${formatDatePeru(e.fecha_fin)}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {modalEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => !guardandoEvento && setModalEvento(false)} />
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Crear evento</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
                <select
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={nuevoEvento.tipo}
                  onChange={(e) => setNuevoEvento((p) => ({ ...p, tipo: e.target.value }))}
                >
                  {TIPOS_EVENTO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-2"
                  value={nuevoEvento.color}
                  onChange={(e) => setNuevoEvento((p) => ({ ...p, color: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha inicio</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={nuevoEvento.fecha_inicio}
                  onChange={(e) => setNuevoEvento((p) => ({ ...p, fecha_inicio: e.target.value }))}
                />
                <p className="text-xs text-gray-900 mt-1">
                  {nuevoEvento.fecha_inicio ? formatDatePeru(nuevoEvento.fecha_inicio) : "dd/mm/yyyy"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha fin (opcional)</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={nuevoEvento.fecha_fin}
                  onChange={(e) => setNuevoEvento((p) => ({ ...p, fecha_fin: e.target.value }))}
                />
                <p className="text-xs text-gray-900 mt-1">
                  {nuevoEvento.fecha_fin ? formatDatePeru(nuevoEvento.fecha_fin) : "dd/mm/yyyy"}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={nuevoEvento.todo_el_dia}
                    onChange={(e) => setNuevoEvento((p) => ({ ...p, todo_el_dia: e.target.checked }))}
                  />
                  Todo el día
                </label>
              </div>

              {!nuevoEvento.todo_el_dia && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hora inicio</label>
                    <input
                      type="time"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={nuevoEvento.hora_inicio}
                      onChange={(e) => setNuevoEvento((p) => ({ ...p, hora_inicio: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hora fin</label>
                    <input
                      type="time"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={nuevoEvento.hora_fin}
                      onChange={(e) => setNuevoEvento((p) => ({ ...p, hora_fin: e.target.value }))}
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción (opcional)</label>
                <textarea
                  className="w-full min-h-[90px] rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={nuevoEvento.descripcion}
                  onChange={(e) => setNuevoEvento((p) => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Detalle del evento…"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={guardandoEvento}
                onClick={() => setModalEvento(false)}
                className="rounded-xl px-4 py-2 font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                disabled={guardandoEvento}
                onClick={crearEvento}
                className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
              >
                {guardandoEvento ? "Guardando..." : "Crear evento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}