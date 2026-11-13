'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { APP_NAME } from '@/config';
import { Eye, EyeOff, User, ArrowLeft, ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Interface untuk data form
interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'staff' | 'manager';
}

const steps = ['Crear cuenta', 'Datos personales', 'Confirmación'];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  
  // State untuk mengetahui apakah komponen sudah di-mount
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'staff'
  });
  
  // Efek untuk menandai bahwa komponen sudah di-mount di sisi klien
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle perubahan input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle langkah selanjutnya
  const handleNext = () => {
    if (activeStep === 0) {
      // Validasi langkah 1 (username dan password)
      if (!formData.username || !formData.password) {
        setError('El usuario y la contraseña son obligatorios.');
        return;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    } else if (activeStep === 1) {
      // Validasi langkah 2 (email dan nama)
      if (!formData.email || !formData.name) {
        setError('El correo electrónico y el nombre completo son obligatorios.');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('El formato del correo electrónico no es válido.');
        return;
      }
    }
    
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle langkah sebelumnya
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { username, password, email, name } = formData;

      if (!username || !email || !password || !name) {
        throw new Error('Completa todos los campos: usuario, correo electrónico, contraseña y nombre.');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('El formato del correo electrónico no es válido.');
      }

      const success = await register(username, password, email, name);
      if (success) {
        // Show success message before redirecting
        setActiveStep(2); // Move to "success" step if you have one
        
        // Redirect to login page after a slight delay
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 1500);
      } else {
        throw new Error('No se pudo completar el registro. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo completar el registro. Inténtalo de nuevo.');
      setActiveStep(0); // Return to first step on error
    } finally {
      setLoading(false);
    }
  };
  
  // Jika belum dimount (masih di server), tampilkan layout minimal
  if (!mounted) {
    return (
      <div className="container max-w-screen-lg mx-auto px-4">
        <div className="min-h-screen flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="p-4">
              <h1 className="text-3xl font-bold mb-2">{APP_NAME}</h1>
              <h2 className="text-xl text-muted-foreground">
                Sistema de gestión para lavanderías
              </h2>
            </div>
            <div>
              <Card>
                <CardHeader className="text-center">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <CardTitle>Crear cuenta</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-screen-lg mx-auto px-4">
      <div className="min-h-screen flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="p-4">
            <h1 className="text-3xl font-bold mb-2">{APP_NAME}</h1>
            <h2 className="text-xl text-muted-foreground mb-4">
              Sistema de gestión para lavanderías
            </h2>
            <p className="text-muted-foreground mb-4">
              Crea tu cuenta para organizar pedidos, clientes y servicios de tu lavandería.
            </p>
          </div>
          
          <div>
            <Card>
              <CardHeader className="text-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                  <User className="h-5 w-5 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Crear cuenta en {APP_NAME}</CardTitle>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="mb-8">
                  <div className="flex justify-between relative">
                    {steps.map((label, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                          ${activeStep > index ? 'bg-primary text-primary-foreground' : 
                            activeStep === index ? 'bg-primary text-primary-foreground' : 
                            'bg-muted text-muted-foreground'}
                        `}>
                          {activeStep > index ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                        <div className="text-xs mt-1">{label}</div>
                      </div>
                    ))}
                    <div className="absolute top-4 left-0 right-0 h-[2px] -z-10 bg-muted">
                      <div 
                        className="h-full bg-primary" 
                        style={{ 
                          width: `${activeStep * 50}%`,
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </div>
                  </div>
                </div>
                
                <form onSubmit={activeStep === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                  {/* Langkah 1: Akun */}
                  {activeStep === 0 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Usuario</Label>
                        <Input
                          id="username"
                          name="username"
                          placeholder="Elige un usuario"
                          autoComplete="username"
                          autoFocus
                          value={formData.username}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Crea una contraseña"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            </span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          La contraseña debe tener al menos 6 caracteres.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Paso 2: datos personales */}
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Escribe tu nombre completo"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Escribe tu correo electrónico"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Paso 3: confirmación */}
                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium mb-2">Confirma tus datos</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Usuario:</div>
                          <div>{formData.username}</div>
                          <div className="text-muted-foreground">Nama:</div>
                          <div>{formData.name}</div>
                          <div className="text-muted-foreground">Email:</div>
                          <div>{formData.email}</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Al continuar, aceptas nuestros términos y condiciones.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={activeStep === 0 || loading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                    </Button>

                    <Button
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                          <span>Memproses...</span>
                        </>
                      ) : activeStep === steps.length - 1 ? (
                        "Crear cuenta"
                      ) : (
                        <>
                          Lanjut
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
              
              <CardFooter className="flex justify-center">
                <div className="text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta? {' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Iniciar sesión
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 