export default function RoiComparison() {
    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-orange-200 rounded-full blur-[100px] opacity-20 -z-10"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-6">
                        ¿Es un gasto o una inversión?
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Mira los números. El Plan Profesional no es un costo extra, es la forma de recuperar el 30% que hoy pierdes en comisiones.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
                    {/* Traditional Apps Card */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm opacity-80 hover:opacity-100 transition duration-300">
                        <h3 className="text-xl font-bold text-slate-500 mb-2">Apps de Delivery</h3>
                        <div className="text-4xl font-extrabold text-red-500 mb-4">
                            30% <span className="text-lg text-slate-400 font-normal">comisión</span>
                        </div>
                        <ul className="space-y-3 text-slate-500 mb-8">
                            <li className="flex items-start gap-2">
                                <span className="text-red-400">❌</span> Pierdes dinero en cada venta
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400">❌</span> Compites con miles de locales
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400">❌</span> No eres dueño de tus clientes
                            </li>
                        </ul>
                        <div className="border-t border-slate-100 pt-6">
                            <p className="text-sm text-slate-400">Costo mensual estimado (Vendiendo $1M)</p>
                            <p className="text-2xl font-bold text-slate-700">$300.000 <span className="text-xs font-normal">perdidos</span></p>
                        </div>
                    </div>

                    {/* LoyalApp Card */}
                    <div className="bg-white p-8 rounded-3xl border-2 border-orange-500 shadow-xl relative transform md:scale-105 z-10">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                            Opción Inteligente 💡
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">LoyalApp</h3>
                        <div className="text-4xl font-extrabold text-green-600 mb-4">
                            0% <span className="text-lg text-slate-400 font-normal">comisión</span>
                        </div>
                        <ul className="space-y-3 text-slate-700 mb-8">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">✅</span> 100% de la venta es tuya
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">✅</span> Tus clientes son tuyos
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">✅</span> Fidelizas y vendes más
                            </li>
                        </ul>
                        <div className="border-t border-slate-100 pt-6">
                            <p className="text-sm text-slate-400">Costo mensual fijo</p>
                            <p className="text-3xl font-bold text-slate-900">$60.000 <span className="text-base font-normal text-slate-500">finales</span></p>
                        </div>
                    </div>
                </div>

                {/* ROI Message */}
                <div className="mt-12 bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto text-center transform hover:scale-[1.01] transition-transform">
                    <p className="text-lg md:text-2xl font-bold text-green-800">
                        🚀 El dato clave:
                    </p>
                    <p className="text-green-700 mt-2 text-lg">
                        Con que desvíes <span className="font-extrabold underline decoration-green-400 decoration-4 underline-offset-2">solo 5 pedidos al mes</span> de las apps a tu propio Menú Digital, <br className="hidden md:block" />
                        <span className="font-bold">¡LoyalApp ya se pagó solo!</span> El resto es ganancia pura.
                    </p>
                </div>
            </div>
        </section>
    );
}
