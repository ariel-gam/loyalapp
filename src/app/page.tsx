import Link from 'next/link';
import Image from 'next/image';
import DynamicHeadline from '@/components/DynamicHeadline';
import RoiComparison from '@/components/RoiComparison';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              LoyalApp
            </span>
          </div>
          <div className="flex gap-8 items-center">
            <Link href="/login" className="hidden sm:block hover:text-orange-600 font-medium transition text-sm">
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-500/20 text-sm"
            >
              Empezar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-bl from-orange-50 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block bg-orange-100 text-orange-700 font-bold px-4 py-1.5 rounded-full text-xs mb-6 uppercase tracking-wider">
              🚀 Nueva Versión 2026
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-6 text-slate-900">
              <DynamicHeadline /> en el <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                celular de tus clientes.
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Sin comisiones abusivas. Sin intermediarios. Solo tus clientes, tu menú digital y tu WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/registro"
                className="bg-orange-600 text-white text-lg px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-xl shadow-orange-500/20"
              >
                Empezar Gratis Ahora
              </Link>
              <Link
                href="/demo-pizza"
                className="bg-white text-slate-700 border border-slate-200 text-lg px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 group"
              >
                Ver Demo en Vivo
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              ✅ Cancelas cuando quieras
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
            {/* Abstract visual representation of the app */}
            <div className="relative z-10 bg-white p-2 rounded-[3rem] shadow-2xl border-8 border-slate-900 aspect-[9/19] max-w-[320px] mx-auto overflow-hidden">
              <div className="bg-slate-900 h-6 w-32 mx-auto rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 z-20"></div>
              <div className="h-full w-full bg-slate-50 overflow-y-auto no-scrollbar">
                {/* Mockup Content: Header */}
                <div className="h-48 bg-orange-600 rounded-b-[2rem] relative flex items-end p-6">
                  <div className="text-white">
                    <h3 className="font-bold text-2xl">Pizzería Napoli</h3>
                    <p className="text-orange-100 text-sm">La mejor de la ciudad 🍕</p>
                  </div>
                </div>
                {/* Mockup Content: Categories */}
                <div className="p-4 space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['Pizzas', 'Empanadas', 'Bebidas'].map((c, i) => (
                      <div key={i} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${i === 0 ? 'bg-orange-600 text-white' : 'bg-white shadow-sm border border-slate-100 text-slate-600'}`}>
                        {c}
                      </div>
                    ))}
                  </div>
                  {/* Mockup Content: Items */}
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                      <div className="w-20 h-20 bg-slate-200 rounded-xl flex-shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-50">🍕</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">Muzzarella Especial</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">Salsa de tomate, doble queso muzzarella y orégano.</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="font-bold text-orange-600">$8.500</span>
                          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">+</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mockup Content: Floating Button */}
                <div className="absolute bottom-4 left-4 right-4 bg-green-500 text-white p-4 rounded-xl font-bold shadow-lg flex justify-between items-center">
                  <span>Ver Pedido (2)</span>
                  <span>$17.000</span>
                </div>
              </div>
            </div>
            {/* Decorative blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </header>

      {/* How it Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Vender nunca fue tan <span className="text-orange-600">simple</span>.
            </h2>
            <p className="text-lg text-slate-600">
              Olvídate de tomar pedidos por teléfono o luchar con PDFs ilegibles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-200 to-transparent -z-1"></div>

            {[
              {
                icon: "📱",
                title: "1. Tu Cliente Elige",
                desc: "Entra a tu link o scanea el QR. Ve tu menú con fotos y elige qué comer."
              },
              {
                icon: "🛒",
                title: "2. Arma el Carrito",
                desc: "Suma productos, elige gustos de empanadas o delivery sin errores."
              },
              {
                icon: "💬",
                title: "3. Recibes en WhatsApp",
                desc: "El pedido te llega listo y detallado a tu WhatsApp. ¡Solo confirmas y listo!"
              }
            ].map((step, i) => (
              <div key={i} className="relative bg-white pt-8 text-center group">
                <div className="w-24 h-24 bg-orange-50 rounded-3xl mx-auto mb-8 flex items-center justify-center text-4xl shadow-sm border border-orange-100 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase: Client Experience */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl rotate-3 opacity-20 blur-lg transform scale-95"></div>
              <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-2">
                <Image
                  src="/images/menu-preview.png"
                  alt="App Demo mockup"
                  width={600}
                  height={400}
                  className="rounded-2xl w-full object-cover"
                  style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
                {/* Overlay describing features */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur p-4 rounded-xl border border-white/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                    <div>
                      <p className="font-bold text-slate-800">Pedido enviado a WhatsApp</p>
                      <p className="text-xs text-slate-500">El cliente no necesita instalar nada</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                Un menú que da <span className="text-orange-600">hambre</span>.
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Una experiencia de compra visual y sin fricciones. Tus clientes amarán ver fotos reales de tus platos en lugar de leer una lista de texto aburrida.
              </p>
              <ul className="space-y-4">
                {[
                  "Fotos de alta calidad para cada producto",
                  "Categorías claras (Pizzas, Bebidas, Postres)",
                  "Carrito flotante siempre visible",
                  "Carga instantánea (funciona con mal internet)"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/demo-pizza" className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-2">
                  Probar el menú como cliente →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase: Admin Control */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-indigo-500/20 text-indigo-300 font-bold px-4 py-1.5 rounded-full text-xs mb-6 uppercase tracking-wider border border-indigo-500/30">
                Panel de Rendimiento
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Decisiones con <span className="text-indigo-400">datos reales</span>.
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Deja de adivinar. Visualiza tus ventas, productos top y logística en tiempo real. Cambia precios en segundos ante la inflación sin depender de un diseñador.
              </p>
              <ul className="space-y-4">
                {[
                  "📊 Métricas en tiempo real (Ventas, Pedidos, Ticket Promedio)",
                  "🏆 Ranking visual de productos más vendidos",
                  "🚚 Distribución de envíos vs retiros",
                  "⚡ Cambia precios y stock instantáneamente",
                  "📈 Estadísticas por día, semana o mes"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-200 font-medium pb-2 border-b border-white/5">
                    <span className="text-indigo-400 text-lg mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/demo-admin" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2">
                  Ver Panel de Control
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* Real Admin Dashboard Screenshot */}
              <div className="bg-white rounded-2xl p-2 shadow-2xl border border-slate-700 transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="/images/admin-dashboard.png"
                  alt="Panel de Rendimiento Profesional"
                  width={800}
                  height={450}
                  className="rounded-xl w-full"
                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                />
                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl font-bold text-sm flex items-center gap-2 animate-pulse">
                  <span className="text-xl">📈</span>
                  Dashboard en Vivo
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>


      {/* Benefits Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-16">
            ¿Por qué elegir <span className="text-orange-600">LoyalApp</span>?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-4">⚡</div>
              <h3 className="font-bold text-xl mb-2 text-slate-900">Velocidad Rocket</h3>
              <p className="text-slate-600 text-sm">Tus clientes quieren comer, no esperar. Nuestra app carga al instante, incluso con datos móviles.</p>
            </div>
            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-4">💰</div>
              <h3 className="font-bold text-xl mb-2 text-slate-900">0% Comisiones</h3>
              <p className="text-slate-600 text-sm">No somos socios en tus ganancias. Pagas una suscripción fija y todo lo que vendes es tuyo.</p>
            </div>
            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-4">🗂️</div>
              <h3 className="font-bold text-xl mb-2 text-slate-900">Base de Datos Propia</h3>
              <p className="text-slate-600 text-sm">Las apps de delivery se quedan con tus clientes. Con LoyalApp, el contacto es 100% tuyo.</p>
            </div>
            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-4">📸</div>
              <h3 className="font-bold text-xl mb-2 text-slate-900">Galería Visual</h3>
              <p className="text-slate-600 text-sm">La comida entra por los ojos. Sube fotos ilimitadas y haz que tus platos se vendan solos.</p>
            </div>
            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-4">🛵</div>
              <h3 className="font-bold text-xl mb-2 text-slate-900">Gestión de Envíos</h3>
              <p className="text-slate-600 text-sm">Define zonas de entrega y costos personalizados. Evita malentendidos con las direcciones.</p>
            </div>
            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-4">🆘</div>
              <h3 className="font-bold text-xl mb-2 text-slate-900">Soporte Prioritario</h3>
              <p className="text-slate-600 text-sm">No estás solo. Te ayudamos a configurar tu carta y a despegar tu negocio digital.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Comparison Section */}
      <RoiComparison />

      {/* Pricing Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Un Plan Simple.</h2>
            <p className="text-lg text-slate-600">Sin letras chicas. Sin costos ocultos.</p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-2xl relative max-w-lg w-full transform hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl rounded-tr-[1.8rem]">
                MÁS ELEGIDO
              </div>
              <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-2">Plan Profesional</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold text-slate-900">$60.000</span>
                <span className="text-slate-500">/ mes</span>
              </div>

              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-8 flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="font-bold text-orange-800 text-sm">Promo Primer Mes</p>
                  <p className="text-orange-600 font-bold text-lg">$35.000 ARS</p>
                </div>
              </div>

              <ul className="space-y-4 mb-8 text-slate-700">
                {['Menú Digital', 'Pedidos Ilimitados', 'Panel de Administración', '0% Comisiones', 'Soporte Técnico', 'Hosting Incluido'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/registro" className="block w-full bg-slate-900 text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition">
                Crear mi Cuenta Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: "¿Sirve para delivery y take-away?", a: "¡Sí! El cliente puede elegir si quiere envío a domicilio o retirar por el local al finalizar su pedido." },
              { q: "¿Cómo recibo los pagos de mis clientes?", a: "Tu arreglas el pago directamente. LoyalApp no interviene. Puedes cobrar en efectivo, transferencia o enviar tu link de pago." },
              { q: "¿Puedo usar mi propio dominio .com?", a: "Sí, podemos configurarlo (tiene un costo adicional único de configuración). Contáctanos para hacerlo." }
            ].map((item, i) => (
              <details key={i} className="group bg-slate-50 rounded-xl overflow-hidden border border-slate-100 open:bg-white open:shadow-md transition-all">
                <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-slate-800 list-none">
                  {item.q}
                  <span className="transition group-open:rotate-180">⌄</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">LoyalApp</h2>
          <div className="flex justify-center gap-6 mb-8">
            <Link href="/login" className="hover:text-white transition">Admin Login</Link>
            <Link href="/demo-pizza" className="hover:text-white transition">Demo Cliente</Link>
            <Link href="https://wa.me/5493454286955" className="hover:text-white transition">WhatsApp Soporte</Link>
          </div>
          <p className="text-sm opacity-50">&copy; 2026 LoyalApp. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5493454286955"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
        title="Contáctanos por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
        </svg>
      </a>
    </div>
  )
}