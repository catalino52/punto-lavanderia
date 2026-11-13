import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package,
  Loader2,
  Phone,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrderTrackerProps {
  onSubmit?: (orderNumber: string, phoneLastDigits: string) => Promise<void>;
  redirectToTrackingPage?: boolean;
  className?: string;
}

export function OrderTracker({ 
  onSubmit, 
  redirectToTrackingPage = true,
  className = '' 
}: OrderTrackerProps) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneLastDigits, setPhoneLastDigits] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!orderNumber) {
      setError('El número de pedido es obligatorio.');
      return;
    }
    
    if (!phoneLastDigits || phoneLastDigits.length !== 4 || !/^\d+$/.test(phoneLastDigits)) {
      setError('Escribe los últimos 4 dígitos del teléfono registrado.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      if (onSubmit) {
        await onSubmit(orderNumber, phoneLastDigits);
      } else if (redirectToTrackingPage) {
        // Default behavior - redirect to tracking page
        router.push(`/track-order/${orderNumber}?verify=${phoneLastDigits}`);
      }
    } catch (error) {
      setError('No se pudo verificar el pedido. Revisa el número y el teléfono e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`shadow-lg border-none overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-4">
        <CardTitle className="text-xl flex items-center text-indigo-800">
          <Package className="mr-2 h-5 w-5 text-indigo-600" />
          Consulta tu pedido
        </CardTitle>
        <CardDescription>
          Escribe el número de pedido y los últimos 4 dígitos del teléfono registrado.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleTrackOrder} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order-number" className="text-gray-700">Número de pedido</Label>
            <div className="relative">
              <Input
                id="order-number"
                placeholder="Escribe el número de tu pedido"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="pl-10 bg-gray-50 cursor-pointer"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Package className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone-digits" className="text-gray-700">Últimos 4 dígitos del teléfono</Label>
            <div className="relative">
              <Input
                id="phone-digits"
                placeholder="Ejemplo: 1234"
                maxLength={4}
                value={phoneLastDigits}
                onChange={(e) => setPhoneLastDigits(e.target.value.replace(/\D/g, ''))}
                className="pl-10 bg-gray-50 cursor-pointer"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Phone className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando...
              </>
            ) : (
              'Consultar pedido'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 