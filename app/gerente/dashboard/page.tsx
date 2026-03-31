"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Toast = { msg: string; type: "success" | "error" } | null;

export default function DashboardGerente() {
  const router = useRouter();

  const TIMEZONE_PERU = "America/Lima";

  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [asistenciasHoy, setAsistenciasHoy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [fechaHoy, setFechaHoy] = useState("");
  const [fechaActual, setFechaActual] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"activo" | "inactivo">("activo");

  const [toast, setToast] = useState<Toast>(null);

  const [modalNuevo, setModalNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevoTrab, setNuevoTrab] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    password: "",
    cargo: "",
    area: "",
  });

  useEffect(() => {
    if (!localStorage.getItem("gerente")) router.push("/gerente/login");
  }, [router]);

  useEffect(() => {
    const hoy = new Date();
    const hoyISO = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE_PERU,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(hoy);

    setFechaHoy(hoyISO);
    setFechaActual(
      hoy.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: TIMEZONE_PERU })
    );
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const cargarTrabajadores = async (search: string) => {
    const res = await fetch(
      `/api/gerente/trabajadores?estado=${estadoFiltro}&search=${encodeURIComponent(search.trim())}`
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Error cargando trabajadores");
    setTrabajadores(data.trabajadores || []);
  };

  const cargarAsistenciasHoy = async (fecha: string) => {
    const res = await fetch(`/api/gerente/asistencias?fecha=${fecha}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Error cargando asistencias");
    setAsistenciasHoy(data.asistencias || []);
  };

  useEffect(() => {
    if (!fechaHoy) return;
    const run = async () => {
      try {
        setLoading(true);
        await cargarTrabajadores(busqueda);
        await cargarAsistenciasHoy(fechaHoy);
      } catch {
        setToast({ msg: "Error cargando datos", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [fechaHoy, estadoFiltro]);

  useEffect(() => {
    if (!fechaHoy) return;
    const t = setTimeout(() => {
      cargarTrabajadores(busqueda).catch(() => setToast({ msg: "Error cargando trabajadores", type: "error" }));
    }, 250);
    return () => clearTimeout(t);
  }, [busqueda]);

  const ultimaAsistenciaHoy = (trabajadorId: number) => {
    const registros = asistenciasHoy.filter((a) => a.trabajador_id === trabajadorId);
    return registros.length ? registros[0] : null;
  };

  const presentes = asistenciasHoy.filter((a) => a.hora_ingreso).length;
  const total = trabajadores.length;
  const ausentes = Math.max(0, total - presentes);

  const cerrarSesion = () => {
    localStorage.removeItem("gerente");
    router.push("/gerente/login");
  };

  const irDetalle = (id: number) => {
    router.push(`/gerente/trabajadores/${id}`);
  };

  const toggleActivo = async (t: any) => {
    try {
      const res = await fetch(`/api/gerente/trabajadores/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !t.activo }),
      });
      const data = await res.json();
      if (!data.success) {
        setToast({ msg: data.error || "No se pudo actualizar estado", type: "error" });
        return;
      }
      setToast({ msg: `Trabajador ${data.trabajador.activo ? "activado" : "desactivado"}`, type: "success" });
      await cargarTrabajadores(busqueda);
      await cargarAsistenciasHoy(fechaHoy);
    } catch {
      setToast({ msg: "Error de conexión al actualizar estado", type: "error" });
    }
  };

  const crearTrabajador = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/gerente/trabajadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: nuevoTrab.dni.trim(),
          nombre: nuevoTrab.nombre.trim(),
          apellido: nuevoTrab.apellido.trim(),
          password: nuevoTrab.password,
          cargo: nuevoTrab.cargo.trim() || null,
          area: nuevoTrab.area.trim() || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setToast({ msg: data.error || "No se pudo crear el trabajador", type: "error" });
        return;
      }
      setToast({ msg: "Trabajador creado correctamente", type: "success" });
      setModalNuevo(false);
      setNuevoTrab({ dni: "", nombre: "", apellido: "", password: "", cargo: "", area: "" });
      await cargarTrabajadores(busqueda);
    } catch {
      setToast({ msg: "Error de conexión al crear trabajador", type: "error" });
    } finally {
      setGuardando(false);
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6 md:p-10">
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm">
          <div
            className={`rounded-xl px-6 py-4 shadow-2xl text-white font-medium flex items-center gap-3 ${
              toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <img src="/img/logo.png" className="h-10 w-10" alt="Logo" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel Gerencial</h1>
            <p className="text-sm text-gray-600">{fechaActual}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModalNuevo(true)}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 font-semibold text-white shadow hover:shadow-lg"
          >
            + Nuevo trabajador
          </button>

          <button
            onClick={cerrarSesion}
            className="rounded-xl bg-red-500 px-4 py-2 text-white font-semibold shadow hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="grid gap-6 mb-10 md:grid-cols-4">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200/50">
          <p className="font-medium text-gray-700">Trabajadores ({estadoFiltro})</p>
          <h2 className="text-3xl font-bold text-gray-900">{total}</h2>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200/50">
          <p className="font-medium text-gray-700">Marcajes hoy</p>
          <h2 className="text-3xl font-bold text-emerald-600">{asistenciasHoy.length}</h2>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200/50">
          <p className="font-medium text-gray-700">Presentes</p>
          <h2 className="text-3xl font-bold text-blue-600">{presentes}</h2>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200/50">
          <p className="font-medium text-gray-700">Ausentes</p>
          <h2 className="text-3xl font-bold text-rose-600">{ausentes}</h2>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEstadoFiltro("activo")}
            className={`rounded-lg px-4 py-2 font-semibold border ${
              estadoFiltro === "activo"
                ? "bg-white text-gray-900 border-gray-300 shadow-sm"
                : "bg-transparent text-gray-600 border-gray-200 hover:bg-white/60"
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setEstadoFiltro("inactivo")}
            className={`rounded-lg px-4 py-2 font-semibold border ${
              estadoFiltro === "inactivo"
                ? "bg-white text-gray-900 border-gray-300 shadow-sm"
                : "bg-transparent text-gray-600 border-gray-200 hover:bg-white/60"
            }`}
          >
            Inactivos
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          className="w-full md:w-96 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/90">
            <tr className="text-gray-600">
              <th className="px-6 py-4 text-left font-semibold">Trabajador</th>
              <th className="px-6 py-4 text-left font-semibold">DNI</th>
              <th className="px-6 py-4 text-left font-semibold">Cargo / Área</th>
              <th className="px-6 py-4 text-left font-semibold">Ingreso hoy</th>
              <th className="px-6 py-4 text-left font-semibold">Salida hoy</th>
              <th className="px-6 py-4 text-left font-semibold">Estado</th>
              <th className="px-6 py-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200/70">
            {trabajadores.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-center text-gray-600" colSpan={7}>
                  No hay trabajadores para mostrar.
                </td>
              </tr>
            ) : (
              trabajadores.map((t) => {
                const asistencia = ultimaAsistenciaHoy(t.id);
                return (
                  <tr key={t.id} className="hover:bg-white/60">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {t.nombre} {t.apellido}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-800">{t.dni}</td>

                    <td className="px-6 py-4 text-gray-700">{(t.cargo || "—") + " / " + (t.area || "—")}</td>

                    <td className="px-6 py-4 text-emerald-700 font-medium">{asistencia?.hora_ingreso || "—"}</td>

                    <td className="px-6 py-4 text-rose-700 font-medium">{asistencia?.hora_salida || "—"}</td>

                    <td className="px-6 py-4">
                      {t.activo ? (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Activo
                        </span>
                      ) : (
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Inactivo
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => irDetalle(t.id)}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-white font-semibold hover:bg-blue-700"
                        >
                          Ver detalle
                        </button>
                        <button
                          onClick={() => toggleActivo(t)}
                          className={`rounded-lg px-3 py-2 font-semibold ${
                            t.activo
                              ? "bg-rose-600 text-white hover:bg-rose-700"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {t.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => !guardando && setModalNuevo(false)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nuevo trabajador</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">DNI</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoTrab.dni}
                  onChange={(e) => setNuevoTrab((p) => ({ ...p, dni: e.target.value }))}
                  placeholder="12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoTrab.password}
                  onChange={(e) => setNuevoTrab((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoTrab.nombre}
                  onChange={(e) => setNuevoTrab((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Piero"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoTrab.apellido}
                  onChange={(e) => setNuevoTrab((p) => ({ ...p, apellido: e.target.value }))}
                  placeholder="Lopez"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cargo (opcional)</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoTrab.cargo}
                  onChange={(e) => setNuevoTrab((p) => ({ ...p, cargo: e.target.value }))}
                  placeholder="Operario"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Área (opcional)</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoTrab.area}
                  onChange={(e) => setNuevoTrab((p) => ({ ...p, area: e.target.value }))}
                  placeholder="Producción"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={guardando}
                onClick={() => setModalNuevo(false)}
                className="rounded-xl px-4 py-2 font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                disabled={guardando}
                onClick={crearTrabajador}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}