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

        <div className="flex gap-4 flex-col sm:flex-row items-center w-full justify-center">
          <Link href="/login" className="bg-white text-orange-600 text-lg px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all w-full sm:w-auto">
            Crear mi Carta Digital
          </Link>
          <Link href="/demo-pizza" className="border-2 border-white/30 text-white text-lg px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all w-full sm:w-auto">
            Ver Demo (Pizzería)
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10">
          <div className="p-4">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">🚀</div>
            <h3 className="font-bold text-xl mb-2">Tu link único</h3>
            <p className="text-orange-100 text-sm">loyalfood.com/tu-negocio. Comparte tu carta digital en Instagram y WhatsApp.</p>
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
      </main>

      <footer className="text-center p-8 text-orange-200/60 text-sm border-t border-white/10">
        &copy; 2025 LoyalFood. Todos los derechos reservados.
      </footer>
    </div>
  )
}
