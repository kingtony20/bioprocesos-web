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
    <main className="min-h-screen flex items-center justify-center bg-gray-200">

      <div className="bg-white p-10 rounded-2xl shadow-xl w-96">

        <h1 className="text-2xl font-bold text-center mb-6">
          Iniciar Sesión
        </h1>

        <input
          type="text"
          placeholder="Usuario o DNI"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-lg mb-6"
        />

        <button
          onClick={iniciarSesion}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-green-600 transition"
        >
          Iniciar Sesión
        </button>

      </div>

    </main>
  );
}