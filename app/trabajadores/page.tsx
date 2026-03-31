"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginTrabajadores() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/trabajadores/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario: usuario.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (!data.success || !data.usuario) {
        setError(data.error || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      router.push("/trabajadores/dashboard");

    } catch (error) {
      console.error(error);
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo y título */}
        <div className="text-center mb-10">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
            <img src="/img/logo.png" alt="Logo" className="h-14 w-14" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Bio Procesos Industriales
          </h1>
          <p className="text-gray-600 mt-2">Acceso Trabajadores</p>
        </div>

        {/* Formulario */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <form onSubmit={iniciarSesion} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de DNI
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 12345678"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-100 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Área exclusiva para trabajadores • Bio Procesos Industriales
        </p>

      </div>
    </main>
  );
}