'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { APP_NAME } from '@/config';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Truck, 
  Search, 
  Package, 
  CheckCircle, 
  ShieldCheck,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderTracker } from '@/components/ui/order-tracker';

// Define the FeatureCard props interface
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">{APP_NAME}</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6 items-center">
            <ModeToggle />
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Iniciar sesión
            </Button>
            <Button 
              onClick={() => router.push('/register')}
              className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600"
            >
              Crear cuenta
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Cuidado de calidad para tu ropa, con la confianza que mereces
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Lavamos y cuidamos tus prendas con procesos confiables, atención cercana y precios claros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/login" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md transition duration-300 text-center cursor-pointer"
              >
                Iniciar sesión / Crear cuenta
              </Link>
              <Link 
                href="#seguimiento" 
                className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-medium py-3 px-6 rounded-md border border-indigo-600 dark:border-indigo-500 transition duration-300 text-center cursor-pointer"
              >
                Consultar pedido
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* SVG Animation */}
            <div className="w-full max-w-md relative">
              <Image
                src="/assets/laundry-hero-animation.svg"
                alt="Ilustración del servicio de lavandería"
                width={600}
                height={400}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Order Tracking Section */}
      <section id="seguimiento" className="w-full py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">
                Consulta el estado de tu pedido
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Consulta el avance de tu pedido. Solo necesitas el número de pedido y los últimos
                cuatro dígitos del teléfono registrado.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <div className="flex items-start space-x-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full text-blue-600 dark:text-blue-300">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Avance del pedido</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Consulta las etapas disponibles de tu pedido</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full text-green-600 dark:text-green-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Tiempo estimado</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Revisa la fecha estimada de entrega</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full text-purple-600 dark:text-purple-300">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Entrega y recogida</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Consulta la información de entrega disponible</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full text-amber-600 dark:text-amber-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Verificación segura</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Confirma tu identidad con los últimos dígitos de tu teléfono</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <OrderTracker className="max-w-md mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-gray-50 mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-50">Atención puntual</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Organizamos cada pedido para ofrecerte un servicio confiable y cumplir con los tiempos acordados.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-50">Cuidado de calidad</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tratamos tus prendas con cuidado y seguimos procesos adecuados para cada servicio.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-50">Precios claros</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Conoce el precio de cada servicio antes de confirmar tu pedido, sin cargos sorpresa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-16 relative overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-800 dark:to-blue-900 opacity-95"></div>
        
        {/* Animated shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-white/20">
            <div className="grid md:grid-cols-5 gap-8 items-center">
              <div className="md:col-span-3 space-y-6">
                <div>
                  <div className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
                    Gestión sencilla para tu lavandería
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                    Administra tu lavandería desde un solo lugar
                  </h2>
                  <p className="text-white/80 text-lg max-w-xl">
                    Organiza pedidos, pagos, clientes y servicios con una herramienta diseñada para facilitar el trabajo diario.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => router.push('/register')}
                    className="bg-white text-indigo-600 dark:bg-gray-100 dark:text-indigo-700 hover:bg-gray-100 dark:hover:bg-white shadow-lg shadow-blue-900/20 font-medium px-6 cursor-pointer"
                  >
                    Crear cuenta
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/login')}
                    className="text-white border-white border-2 bg-white/15 hover:bg-white/25 font-medium px-6 cursor-pointer shadow-md shadow-blue-900/10"
                  >
                    Iniciar sesión
                  </Button>
                </div>
                
                <p className="text-sm text-white/80 pt-4">
                  Mantén la información de tu operación organizada y accesible.
                </p>
              </div>
              
              <div className="md:col-span-2 relative">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Gestión de pedidos</h4>
                        <p className="text-sm text-white/70">Organiza los pedidos desde una sola plataforma</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Entrega y recogida</h4>
                        <p className="text-sm text-white/70">Organiza las fechas y el seguimiento</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Informes</h4>
                        <p className="text-sm text-white/70">Consulta la actividad de tu negocio</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 dark:border-gray-700 py-8 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{APP_NAME}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Una plataforma para organizar los pedidos, pagos y servicios de tu lavandería.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Enlaces</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Iniciar sesión</Link></li>
                <li><Link href="/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Crear cuenta</Link></li>
                <li><Link href="#seguimiento" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Consultar pedido</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Atención</h3>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 dark:text-gray-400">Comunícate con tu sucursal para recibir asistencia.</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}
