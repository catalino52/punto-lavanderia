'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { APP_NAME } from '@/config';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });

  // Check if user just registered or was logged out
  useEffect(() => {
    setMounted(true);
    
    // Check URL parameters for states
    const registered = searchParams?.get('registered');
    const expired = searchParams?.get('expired');
    
    if (registered === 'true') {
      setSuccessMessage('Registro exitoso. Inicia sesión con tu nueva cuenta.');
    } else if (expired === 'true') {
      setError('Tu sesión ha vencido. Inicia sesión nuevamente.');
    }
  }, [searchParams]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('El usuario y la contraseña son obligatorios.');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      // Direct login without getting CSRF token first
      const loginResult = await login(formData.username, formData.password);
      
      if (loginResult) {
        const callbackUrl = searchParams?.get('callbackUrl') || '/admin/dashboard';
        router.push(callbackUrl);
      } else {
        throw new Error('No se pudo iniciar sesión.');
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('La sesión ha vencido. Actualiza la página e inténtalo de nuevo.');
      } else {
        setError(err.message || 'No se pudo iniciar sesión. Revisa tu usuario y contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      remember: checked
    }));
  };
  
  // Simplified version for SSR
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
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                    <Lock className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle>Iniciar sesión</CardTitle>
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
              Administra tu lavandería de forma sencilla. Organiza pedidos, clientes y la actividad de tu negocio desde una sola plataforma.
            </p>
          </div>
          
          <div>
            <Card>
              <CardHeader className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                  <Lock className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Iniciar sesión en {APP_NAME}</CardTitle>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {successMessage && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuario</Label>
                      <Input
                        id="username"
                        name="username"
                        placeholder="Escribe tu usuario"
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
                          placeholder="Escribe tu contraseña"
                          autoComplete="current-password"
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
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={formData.remember}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <Label htmlFor="remember" className="text-sm font-normal">
                        Recordarme
                      </Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                          <span>Iniciando sesión...</span>
                        </>
                      ) : (
                        "Iniciar sesión"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-center w-full">
                  <Link href="/register" className="text-primary hover:underline text-sm">
                    ¿No tienes una cuenta? Créala aquí
                  </Link>
                </div>
                
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <Link href="/" className="hover:underline">
                    Volver al inicio
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