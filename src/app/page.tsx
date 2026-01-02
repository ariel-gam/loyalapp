import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 to-red-700 flex flex-col text-white">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">LoyalApp</span>
        </div>
        <nav className="flex gap-6 items-center">
          <Link href="/login" className="hidden sm:block hover:text-orange-100 font-medium transition">Iniciar Sesión</Link>
          <Link href="/login" className="bg-white text-orange-600 px-5 py-2.5 rounded-full font-bold hover:bg-gray-100 transition shadow-lg shadow-orange-900/10">Empezar Gratis</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/30 rounded-full blur-3xl -z-10"></div>

        {/* LoyalFood / Pedidos Section - Updated Copy */}
        <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
          Tu Pizzería en el <br />
          <span className="text-amber-300">celular de tus clientes.</span>
        </h2>

        <p className="text-xl md:text-2xl mb-12 max-w-2xl text-orange-50 leading-relaxed">
          Olvídate de los PDFs que nadie lee. Ofrece una carta interactiva y profesional.
        </p>

        <div className="flex gap-4 flex-col sm:flex-row items-center w-full justify-center flex-wrap">
          <Link href="/login" className="bg-white text-orange-600 text-lg px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all w-full sm:w-auto">
            Digitalizar mi negocio
          </Link>
          <Link href="/demo-pizza" className="border-2 border-white/30 text-white text-lg px-6 py-4 rounded-full font-bold hover:bg-white/10 transition-all w-full sm:w-auto text-center">
            🍕 Ver Menú de Ejemplo
          </Link>
          <Link href="/demo-admin" className="border-2 border-amber-400/50 text-amber-200 text-lg px-6 py-4 rounded-full font-bold hover:bg-amber-500/10 transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2">
            ⚙️ Panel Admin
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10">
          <div className="p-4">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">✅</div>
            <h3 className="font-bold text-xl mb-2">Pedidos Claros</h3>
            <p className="text-orange-100 text-sm">Recibí el detalle exacto (sabores, cocina) directo al WhatsApp.</p>
          </div>
          <div className="p-4">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">📸</div>
            <h3 className="font-bold text-xl mb-2">Fotos que venden</h3>
            <p className="text-orange-100 text-sm">Galería visual atractiva para tentar al cliente y aumentar el ticket.</p>
          </div>
          <div className="p-4">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">🏷️</div>
            <h3 className="font-bold text-xl mb-2">Gestión de Stock/Precios</h3>
            <p className="text-orange-100 text-sm">Cambiá los precios en 10 segundos ante la inflación.</p>
          </div>
        </div>


        {/* Pricing Section (LoyalFood) */}
        <div className="mt-32 w-full max-w-5xl">
          <h3 className="text-3xl md:text-5xl font-bold mb-12 text-center">Planes Simples</h3>
          <div className="flex justify-center">
            <div className="bg-gradient-to-b from-amber-500/20 to-orange-600/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-amber-400/30 flex flex-col relative overflow-hidden max-w-lg w-full transform hover:scale-105 transition-all duration-300 shadow-2xl">
              <div className="absolute top-0 right-0 bg-amber-400 text-orange-900 text-xs font-bold px-3 py-1 rounded-bl-xl">TODO INCLUIDO</div>
              <h4 className="text-3xl font-bold mb-2">Plan Profesional</h4>
              <p className="text-orange-200 mb-6 text-sm">Todo lo que necesitas para vender más.</p>
              <div className="text-5xl font-extrabold mb-8">$60.000 <span className="text-xl font-normal opacity-70">ARS / mes</span></div>

              <ul className="space-y-4 mb-8 flex-1 opacity-90 text-lg">
                <li className="flex items-center gap-3"><span className="text-amber-300 text-xl">✓</span> Carta Digital Autoadministrable</li>
                <li className="flex items-center gap-3"><span className="text-amber-300 text-xl">✓</span> Pedidos Ilimitados por WhatsApp</li>
                <li className="flex items-center gap-3"><span className="text-amber-300 text-xl">✓</span> Panel de Control y Estadísticas</li>
                <li className="flex items-center gap-3"><span className="text-amber-300 text-xl">✓</span> 0% Comisiones por venta</li>
                <li className="flex items-center gap-3"><span className="text-amber-300 text-xl">✓</span> Soporte Técnico Prioritario</li>
              </ul>

              <Link href="/login" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white w-full py-4 rounded-xl font-bold text-xl hover:opacity-90 transition text-center shadow-lg uppercase tracking-wide">
                Empezar Ahora
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-32 mb-20 w-full max-w-5xl">
          <h3 className="text-3xl md:text-5xl font-bold mb-12 text-center">Confían en nosotros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "Desde que uso LoyalApp, mis pedidos por WhatsApp son mucho más ordenados. ¡Me ahorró horas de trabajo!", author: "Carlos M.", role: "Dueño de Pizzería Napoli" },
              { text: "A mis clientes les encanta ver el menú con fotos y armar su pedido. Las ventas subieron un 20%.", author: "Sofia R.", role: "La Burguesía" },
              { text: "La configuración fue súper rápida. En 10 minutos ya estaba compartiendo mi link.", author: "Juan P.", role: "Sushi Time" }
            ].map((t, i) => (
              <div key={i} className="bg-white/10 p-6 rounded-2xl border border-white/5">
                <p className="italic text-orange-50 mb-4">"{t.text}"</p>
                <div className="font-bold">{t.author}</div>
                <div className="text-xs text-orange-200 uppercase tracking-wide">{t.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Turnera Section - Updated Copy */}
        <div className="mt-32 mb-24 w-full max-w-5xl text-center">
          <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Tu Negocio de Turnos, <br />
              <span className="text-amber-300">en Piloto Automático.</span>
            </h2>

            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-orange-50 leading-relaxed">
              Recupera tu tiempo. Deja que el sistema trabaje 24/7 reservando y cobrando por vos.
            </p>

            {/* Turnera Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-left max-w-4xl mx-auto">
              <div className="bg-orange-900/20 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="text-3xl">💰</div>
                <div>
                  <h4 className="font-bold text-lg text-white">Señas Automáticas</h4>
                  <p className="text-orange-100 text-sm">Con Mercado Pago para evitar que el cliente falte (No-Show).</p>
                </div>
              </div>
              <div className="bg-orange-900/20 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="text-3xl">🎛️</div>
                <div>
                  <h4 className="font-bold text-lg text-white">Panel de Control Total</h4>
                  <p className="text-orange-100 text-sm">Gestiona toda tu agenda fácilmente desde tu celular.</p>
                </div>
              </div>
              <div className="bg-orange-900/20 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="text-3xl">🤝</div>
                <div>
                  <h4 className="font-bold text-lg text-white">Cero Comisiones</h4>
                  <p className="text-orange-100 text-sm">Suscripción fija de $35.000. Tu ganancia es tuya.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="https://turnera.loyalapp.com.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-orange-600 text-lg px-6 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all inline-flex items-center gap-2"
              >
                📅 Ver App Clientes
              </a>
              <a
                href="https://turnera.loyalapp.com.ar/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white/30 text-white text-lg px-6 py-4 rounded-full font-bold hover:bg-white/10 transition-all inline-flex items-center gap-2 text-center"
              >
                ⚙️ Panel Admin
              </a>
            </div>
            <p className="mt-6 text-orange-100/70 text-sm">
              Datos de acceso demo: usuario <strong>cancha-padel</strong> / clave <strong>admin</strong>
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center p-8 text-orange-200/60 text-sm border-t border-white/10">
        &copy; 2026 LoyalApp. Todos los derechos reservados.
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5493454286955"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
        title="Contáctanos por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
        </svg>
      </a>
    </div>
  )
}