"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardGerente() {

  const router = useRouter();

  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [fechaHoy, setFechaHoy] = useState("");
  const [fechaActual, setFechaActual] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [toast, setToast] = useState<any>(null);

  // protección login
  useEffect(() => {
    if (!localStorage.getItem("gerente")) {
      router.push("/gerente/login");
    }
  }, [router]);

  // fecha cliente
  useEffect(() => {

    const hoy = new Date();

    setFechaHoy(hoy.toISOString().split("T")[0]);

    setFechaActual(
      hoy.toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long"
      })
    );

  }, []);

  // cargar datos
  useEffect(() => {

    const cargarDatos = async () => {

      try {

        const resTrab = await fetch("/api/trabajadores");
        const dataTrab = await resTrab.json();

        if (dataTrab.success) {
          setTrabajadores(dataTrab.trabajadores);
        }

        const resAsis = await fetch(`/api/asistencias?fecha=${fechaHoy}`);
        const dataAsis = await resAsis.json();

        if (dataAsis.success) {
          setAsistencias(dataAsis.asistencias);
        }

      } catch (error) {

        setToast({
          msg: "Error cargando datos",
          type: "error"
        });

      } finally {
        setLoading(false);
      }

    };

    if (fechaHoy) cargarDatos();

  }, [fechaHoy]);

  // trabajadores filtrados
  const trabajadoresFiltrados = trabajadores.filter((t) =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.dni.includes(busqueda)
  );

  // obtener última asistencia
  const ultimaAsistencia = (trabajadorId: number) => {

    const registros = asistencias
      .filter(a => a.trabajador_id === trabajadorId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return registros[0];

  };

  // estadísticas
  const presentes = asistencias.filter(a => a.hora_ingreso).length;

  const ausentes = trabajadores.length - presentes;

  const cerrarSesion = () => {

    localStorage.removeItem("gerente");
    router.push("/gerente/login");

  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  return (

    <main className="min-h-screen bg-gray-100 p-8 text-gray-700">

      {/* HEADER */}

      <header className="flex justify-between items-center mb-10">

        <div className="flex items-center gap-4">

          <img src="/img/logo.png" className="h-12" />

          <h1 className="text-2xl font-bold">
            Panel Gerencial
          </h1>

        </div>

        <div className="flex items-center gap-6">

          <span className="font-medium">
            {fechaActual}
          </span>

          <button
            onClick={cerrarSesion}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Cerrar sesión
          </button>

        </div>

      </header>

      {/* ESTADÍSTICAS */}

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="font-medium">
            Trabajadores
          </p>

          <h2 className="text-3xl font-bold">
            {trabajadores.length}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="font-medium">
            Marcajes hoy
          </p>

          <h2 className="text-3xl font-bold text-green-600">
            {asistencias.length}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="text-gray-500">
            Presentes
          </p>

          <h2 className="text-3xl font-bold text-blue-600">
            {presentes}
          </h2>

        </div>

        <div className="bg-white p-6 rounded-xl shadow">

          <p className="text-gray-500">
            Ausentes
          </p>

          <h2 className="text-3xl font-bold text-red-600">
            {ausentes}
          </h2>

        </div>

      </div>

      {/* BUSCADOR */}

      <div className="mb-6">

        <input
          type="text"
          placeholder="Buscar trabajador por nombre o DNI..."
          className="w-full md:w-96 p-3 border rounded-lg"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

      </div>

      {/* TABLA */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="px-6 py-4 text-left">Nombre</th>
              <th className="px-6 py-4 text-left">DNI</th>
              <th className="px-6 py-4 text-left">Último ingreso</th>
              <th className="px-6 py-4 text-left">Última salida</th>
              <th className="px-6 py-4 text-left">Estado</th>

            </tr>

          </thead>

          <tbody>

            {trabajadoresFiltrados.map((t) => {

              const asistencia = ultimaAsistencia(t.id);

              return (

                <tr key={t.id} className="border-t hover:bg-gray-50">

                  <td className="px-6 py-4 font-medium">
                    {t.nombre}
                  </td>

                  <td className="px-6 py-4">
                    {t.dni}
                  </td>

                  <td className="px-6 py-4 text-green-700">

                    {asistencia?.hora_ingreso || "—"}

                  </td>

                  <td className="px-6 py-4 text-red-700">

                    {asistencia?.hora_salida || "—"}

                  </td>

                  <td className="px-6 py-4">

                    {asistencia?.hora_ingreso ? (

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Presente
                      </span>

                    ) : (

                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                        Ausente
                      </span>

                    )}

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

    </main>

  );
}