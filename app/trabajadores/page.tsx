"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginTrabajadores() {

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const iniciarSesion = async () => {
    try {
      const res = await fetch("/api/login", {     // ← ¡Cambia esto!
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario,
          password
        })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        router.push("/trabajadores/dashboard");
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error(error);
      alert("Error conectando con el servidor");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-950">
          Iniciar Sesión
        </h1>

        <div className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Usuario o DNI"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="
                w-full 
                border border-gray-300 
                p-4 
                rounded-xl 
                bg-gray-50 
                text-slate-950 
                text-lg 
                placeholder:text-gray-500 
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-500 
                focus:border-blue-500 
                transition-all
              "
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full 
                border border-gray-300 
                p-4 
                rounded-xl 
                bg-gray-50 
                text-slate-950 
                text-lg 
                placeholder:text-gray-500 
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-500 
                focus:border-blue-500 
                transition-all
              "
            />
          </div>

          <button
            onClick={iniciarSesion}
            className="
              w-full 
              bg-gradient-to-r from-blue-600 to-indigo-600 
              text-white 
              py-4 
              rounded-xl 
              font-semibold 
              text-lg 
              shadow-lg 
              hover:from-blue-700 
              hover:to-indigo-700 
              hover:shadow-xl 
              active:scale-95 
              transition-all
            "
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </main>
  );
}