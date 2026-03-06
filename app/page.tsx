"use client";

import { useRef } from "react";

export default function Home() {

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      e.preventDefault();
      e.stopPropagation(); // evita que la página también haga scroll
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <main className="bg-gray-200 text-gray-800">

      {/* NAVBAR */}
      <nav className="w-full bg-blue-900 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">

          {/* icono menu */}
          <img
            src="/img/menu.png"
            alt="menu"
            className="w-8 h-8 cursor-pointer"
          />

          {/* logo */}
          <img
            src="/img/logo.png"
            alt="logo"
            className="w-10"
          />

        </div>

        <ul className="flex gap-8 font-semibold text-sm">
          <li className="cursor-pointer hover:text-green-300">INICIO</li>
          <li className="cursor-pointer hover:text-green-300">QUIENES SOMOS</li>
          <li className="cursor-pointer hover:text-green-300">PRODUCTOS</li>
          <li className="cursor-pointer hover:text-green-300">CONTACTO</li>
        </ul>
      </nav>

      {/* HERO */}
      <section
        className="relative h-[500px] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: "url('/img/fondo.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        {/* overlay oscuro */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* contenido */}
        <div className="relative z-10 px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-2xl">
            BIO PROCESOS <br /> INDUSTRIALES S.A.C
          </h1>

          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto">
            Innovación en bioprocesos agrícolas para una producción
            sostenible y eficiente.
          </p>
        </div>

      </section>

      {/* QUIENES SOMOS */}
      <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-10 items-center">

        {/* TARJETA TEXTO */}
        <div className="bg-gray-100 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            ¿Quienes somos?
          </h2>

          <p className="text-gray-700 leading-relaxed">
            Somos una empresa especializada en bioprocesos industriales
            aplicados al sector agrícola, comprometidos con el desarrollo
            sostenible y la optimización de recursos naturales.
          </p>
        </div>

        {/* IMAGEN */}
        <img
          src="/img/somos.jpg"
          alt="Agricultura"
          className="rounded-2xl shadow-lg"
        />

      </section>

      {/* PRODUCTOS */}
      <section className="max-w-6xl mx-auto px-6 py-12">

        <div className="bg-gray-100 rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-green-700 mb-6">
            PRODUCTOS
          </h2>

          <div
            ref={scrollRef}
            onWheel={handleWheel}
            onMouseEnter={() => document.body.style.overflow = "hidden"}
            onMouseLeave={() => document.body.style.overflow = "auto"}
            className="flex gap-6 overflow-x-auto scrollbar-hide"
          >

            <img src="/img/maiz.jpg" className="h-32 rounded-lg shadow-md flex-shrink-0" />
            <img src="/img/arroz.jpg" className="h-32 rounded-lg shadow-md flex-shrink-0" />
            <img src="/img/trigo.jpg" className="h-32 rounded-lg shadow-md flex-shrink-0" />
            <img src="/img/cebada.jpg" className="h-32 rounded-lg shadow-md flex-shrink-0" />
            <img src="/img/quinua.jpg" className="h-32 rounded-lg shadow-md flex-shrink-0" />

            <img src="/img/maiz.jpg" className="h-32 rounded-lg shadow-md flex-shrink-0" />
            <img src="/img/arroz.jpg" className="h-32 rounded-lg shadow-md flex-shrink-0" />
            <img src="/img/trigo.jpg" className="h-32 rounded-lg shadow-md flex-shrink-0" />
            <img src="/img/cebada.jpg" className="h-32 rounded-lg shadow-md flex-shrink-0" />
            <img src="/img/quinua.jpg" className="h-32 rounded-lg shadow-md flex-shrink-0" />

          </div>

        </div>

      </section>

      {/* MISION Y VISION */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">

        {/* MISION */}
        <div className="bg-gray-100 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            MISION
          </h2>

          <p className="text-gray-700">
            Desarrollar soluciones biotecnológicas innovadoras que
            impulsen la productividad agrícola de manera responsable
            y sostenible.
          </p>
        </div>

        {/* VISION */}
        <div className="bg-gray-100 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            VISION
          </h2>

          <p className="text-gray-700">
            Ser una empresa líder en bioprocesos industriales agrícolas,
            reconocida por su innovación, calidad y compromiso ambiental.
          </p>
        </div>

      </section>

      {/* PROTECCIÓN DE CULTIVOS */}
      <section className="w-full bg-blue-900 text-white py-16">

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

          {/* TEXTO */}
          <div>

            <h2 className="text-3xl font-bold mb-8">
              PROTECCIÓN DE CULTIVOS CON pH NEUTRO
            </h2>

            <ul className="space-y-6">

              <li className="flex items-start gap-4">
                <span className="text-green-400 text-2xl">✓</span>
                <p>
                  Eficaz proceso de limpieza liberando a la planta de polvo,
                  suciedad y residuos de plaguicidas.
                </p>
              </li>

              <li className="flex items-start gap-4">
                <span className="text-green-400 text-2xl">✓</span>
                <p>
                  Forma una biopelícula que envuelve a las partículas del
                  polvo y otros contaminantes (plagas, ácaros, insectos, etc)
                  y las extrae de la superficie de las plantas.
                </p>
              </li>

              <li className="flex items-start gap-4">
                <span className="text-green-400 text-2xl">✓</span>
                <p>
                  Contiene pH neutro el cual le permite realizar todas las
                  aplicaciones que se consideren necesarias.
                </p>
              </li>

            </ul>

          </div>

          {/* IMAGEN */}
          <div className="flex justify-center">
            <ul className="space-y-6">

              <h1 className="text-6xl font-bold mb-8 flex justify-center"> Kluntog</h1>

              <img
                src="/img/hojas.png"
                alt="cultivos"
                className="w-64 h-64 object-cover rounded-full shadow-2xl"
              />

            </ul>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-900 text-white py-6 text-center">
        © {new Date().getFullYear()} BIO PROCESOS INDUSTRIALES S.A.C
      </footer>

    </main>
  );
}