import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 to-red-700 flex flex-col text-white">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">LoyalApp</span>
          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">SaaS</span>
        </div>
        <nav className="flex gap-6 items-center">
          <Link href="/login" className="hidden sm:block hover:text-orange-100 font-medium transition">Iniciar Sesión</Link>
          <Link href="/login" className="bg-white text-orange-600 px-5 py-2.5 rounded-full font-bold hover:bg-gray-100 transition shadow-lg shadow-orange-900/10">Empezar Gratis</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/30 rounded-full blur-3xl -z-10"></div>

        <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
          Tu propio sistema de pedidos<br />
          <span className="text-amber-300">sin comisiones.</span>
        </h2>

        <p className="text-xl md:text-2xl mb-12 max-w-2xl text-orange-50 leading-relaxed">
          Creamos tu carta digital y panel de control en segundos. Recibe pedidos en WhatsApp y fideliza a tus clientes.
        </p>

        <div className="flex gap-4 flex-col sm:flex-row items-center w-full justify-center flex-wrap">
          <Link href="/login" className="bg-white text-orange-600 text-lg px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all w-full sm:w-auto">
            Crear mi Carta Digital
          </Link>
          <Link href="/demo-pizza" className="border-2 border-white/30 text-white text-lg px-6 py-4 rounded-full font-bold hover:bg-white/10 transition-all w-full sm:w-auto text-center">
            🍕 Ver Demo Pizzería
          </Link>
          <Link href="/demo-admin" className="border-2 border-white/30 text-white text-lg px-6 py-4 rounded-full font-bold hover:bg-white/10 transition-all w-full sm:w-auto text-center">
            📊 Probar Panel Admin
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10">
          <div className="p-4">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">🚀</div>
            <h3 className="font-bold text-xl mb-2">Tu link único</h3>
            <p className="text-orange-100 text-sm">loyalapp.com/tu-negocio. Comparte tu carta digital en Instagram y WhatsApp.</p>
          </div>
          <div className="p-4">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">📱</div>
            <h3 className="font-bold text-xl mb-2">Pedidos Directos</h3>
            <p className="text-orange-100 text-sm">Los clientes arman su pedido y te llega listo a WhatsApp. Sin intermediarios.</p>
          </div>
          <div className="p-4">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">📊</div>
            <h3 className="font-bold text-xl mb-2">Panel con estadísticas</h3>
            <p className="text-orange-100 text-sm">Controla tus ventas, productos y base de clientes desde tu administrador.</p>
          </div>
        </div>


        {/* Pricing Section */}
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

        {/* Turnera Section */}
        <div className="mt-32 mb-24 w-full max-w-5xl text-center">
          <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Tu Negocio de Turnos <br />
              <span className="text-amber-300">en Piloto Automático.</span>
            </h2>

            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-orange-50 leading-relaxed">
              Deja de perder tiempo respondiendo WhatsApp. Permite que tus clientes reserven y paguen sus canchas o citas 100% online.
            </p>

            {/* Turnera Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-left max-w-4xl mx-auto">
              <div className="bg-orange-900/20 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="text-3xl">📅</div>
                <div>
                  <h4 className="font-bold text-lg text-white">Agenda 24/7</h4>
                  <p className="text-orange-100 text-sm">Tus clientes reservan a cualquier hora sin molestarte.</p>
                </div>
              </div>
              <div className="bg-orange-900/20 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="text-3xl">💳</div>
                <div>
                  <h4 className="font-bold text-lg text-white">Señas Automáticas</h4>
                  <p className="text-orange-100 text-sm">Cobra señas con Mercado Pago para confirmar turnos.</p>
                </div>
              </div>
              <div className="bg-orange-900/20 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                <div className="text-3xl">🔔</div>
                <div>
                  <h4 className="font-bold text-lg text-white">Recordatorios</h4>
                  <p className="text-orange-100 text-sm">Reduce el ausentismo con avisos automáticos.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <a
                href="https://turnera.loyalapp.com.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-orange-600 text-lg px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all inline-flex items-center gap-2"
              >
                📅 Ir a Turnera
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center p-8 text-orange-200/60 text-sm border-t border-white/10">
        &copy; 2026 LoyalApp. Todos los derechos reservados.
      </footer>
    </div>
  )
}
