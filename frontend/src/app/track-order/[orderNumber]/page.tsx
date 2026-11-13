'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock,
  CalendarClock,
  User,
  Phone,
  ClipboardList,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderService, TrackOrderResponse } from '@/services/order.service';

const statusInfo = {
  new: { 
    label: 'Orden recibida', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Clock
  },
  processing: { 
    label: 'En proceso', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Package
  },
  washing: { 
    label: 'En lavado', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Package
  },
  drying: { 
    label: 'En secado', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Package
  },
  folding: { 
    label: 'En doblado', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Package
  },
  ready: { 
    label: 'Lista para retirar', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2
  },
  delivered: { 
    label: 'Entregada', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck
  },
  cancelled: { 
    label: 'Cancelada', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle
  }
};

const paymentStatusInfo = {
  pending: {
    label: 'Pendiente de pago',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  partial: {
    label: 'Pago parcial',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  completed: {
    label: 'Pagada',
    color: 'bg-green-100 text-green-800 border-green-200'
  }
};

export default function TrackOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string || '';
  const verifyDigits = searchParams?.get('verify') || '';
  
  const [order, setOrder] = useState<TrackOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Validate that we have verification digits
    if (!verifyDigits || verifyDigits.length !== 4) {
      setError('El código de verificación no es válido.');
      setLoading(false);
      return;
    }

    // Fetch order data from API
    const fetchOrder = async () => {
      try {
        const orderData = await OrderService.trackOrder(orderNumber);
        setOrder(orderData);
        setLoading(false);
      } catch (err) {
        setError('No se pudo cargar la orden. Verifica el número e inténtalo de nuevo.');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber, verifyDigits]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No especificada';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Fecha no válida';
      
      return date.toLocaleDateString('es-DO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'No se pudo dar formato a la fecha.';
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'RD$ 0';
    return `RD$ ${amount.toLocaleString('es-DO')}`;
  };

  // Utility function to get service processing time in days
  const getServiceProcessingTime = (serviceType: string): number => {
    // Durasi dalam hari berdasarkan tipe layanan
    const serviceTimesMap: Record<string, number> = {
      'regular': 2,      // 2 hari untuk layanan reguler
      'express': 1,      // 1 hari untuk layanan express
      'super-express': 0.5, // 12 jam untuk super express
      'dry-cleaning': 3,  // 3 hari untuk dry cleaning
      'premium': 2.5,    // 2.5 hari untuk layanan premium
      'heavy': 3,        // 3 hari untuk item berat/besar
      'delicate': 3      // 3 hari untuk pakaian halus/delicate
    };
    
    return serviceTimesMap[serviceType] || 2; // Default 2 hari jika tipe tidak dikenal
  };

  // Add function to calculate estimated delivery date
  const getEstimatedDeliveryDate = (createdAt: string | null | undefined, status: string): string => {
    if (!createdAt) return 'Por determinar';
    
    try {
      const orderDate = new Date(createdAt);
      if (isNaN(orderDate.getTime())) return 'Por determinar';
      
      // Add different days based on current status
      let daysToAdd = 2; // Default: 2 days for new orders
      
      // Cek apakah order memiliki data items
      if (order?.items && order.items.length > 0) {
        // Cari item dengan durasi proses terlama
        daysToAdd = order.items.reduce((maxDays, item) => {
          const serviceDuration = getServiceProcessingTime(item.serviceType);
          return serviceDuration > maxDays ? serviceDuration : maxDays;
        }, 0);
      } else {
        // Jika data items tidak tersedia, gunakan estimasi berdasarkan status
        if (status === 'processing' || status === 'washing') {
          daysToAdd = 1; // 1 more day if already processing
        } else if (status === 'drying' || status === 'folding') {
          daysToAdd = 0.5; // 12 hours if already drying/folding
        } else if (status === 'ready' || status === 'delivered') {
          return 'Lista para retirar o entregar';
        }
      }
      
      // Calculate estimated date
      const estimatedDate = new Date(orderDate);
      estimatedDate.setDate(orderDate.getDate() + Math.floor(daysToAdd));
      
      // If there's a fractional day, add hours
      if (daysToAdd % 1 !== 0) {
        estimatedDate.setHours(
          estimatedDate.getHours() + Math.round((daysToAdd % 1) * 24)
        );
      }
      
      return formatDate(estimatedDate.toISOString());
    } catch (error) {
      console.error('Error calculating estimated delivery:', error);
      return 'Por determinar';
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
          </Button>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No encontramos la orden</h2>
              <p className="text-gray-600 mb-6">
                {error || 'No encontramos la orden o falló la verificación.'}
              </p>
              <Button onClick={() => router.push('/')}>
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Guard against all potential undefined values
  const orderStatus = order?.status || 'new';
  const StatusIcon = statusInfo[orderStatus as keyof typeof statusInfo]?.icon || Clock;
  const statusLabel = statusInfo[orderStatus as keyof typeof statusInfo]?.label || 'Estado desconocido';
  const statusColor = statusInfo[orderStatus as keyof typeof statusInfo]?.color || 'bg-gray-100 text-gray-800';
  
  const paymentStatus = order?.paymentStatus || 'pending';
  const paymentStatusLabel = paymentStatusInfo[paymentStatus as keyof typeof paymentStatusInfo]?.label || 'Desconocido';
  const paymentStatusColor = paymentStatusInfo[paymentStatus as keyof typeof paymentStatusInfo]?.color || 'bg-gray-100 text-gray-800';

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>
        <h1 className="text-3xl font-bold">{order?.orderNumber || 'Seguimiento de la orden'}</h1>
        <p className="text-gray-500">Seguimiento de la orden</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Estado actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className={`rounded-full p-3 ${statusColor.split(' ')[0]}`}>
                  <StatusIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <Badge className={statusColor}>
                    {statusLabel}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    Última actualización: {order?.createdAt ? new Date(order.createdAt).toLocaleString('es-DO') : 'Desconocida'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-px bg-gray-200"></div>
                  
                  <div className="space-y-6 relative">
                    <div className="flex">
                      <div className="flex-shrink-0 z-10">
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium">Orden recibida</h3>
                        <p className="text-xs text-gray-500">{formatDate(order?.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 z-10">
                        <div className={`h-8 w-8 rounded-full ${orderStatus !== 'new' ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center`}>
                          {orderStatus !== 'new' ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <Clock className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium">Proceso</h3>
                        <p className="text-xs text-gray-500">
                          {orderStatus !== 'new' ? 'El proceso comenzó' : 'Pendiente de iniciar'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 z-10">
                        <div className={`h-8 w-8 rounded-full ${orderStatus === 'ready' || orderStatus === 'delivered' ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center`}>
                          {orderStatus === 'ready' || orderStatus === 'delivered' ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <Package className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium">Lista para retirar o entregar</h3>
                        <p className="text-xs text-gray-500">
                          {orderStatus === 'ready' || orderStatus === 'delivered' ? 
                            'Tu orden está lista' : 
                            order?.deliveryDate ? 
                              `Estimado: ${formatDate(order.deliveryDate)}` :
                              'La estimación se actualizará cuando procesemos la orden.'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 z-10">
                        <div className={`h-8 w-8 rounded-full ${orderStatus === 'delivered' ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center`}>
                          {orderStatus === 'delivered' ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <Truck className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium">Entregada o retirada</h3>
                        <p className="text-xs text-gray-500">
                          {orderStatus === 'delivered' ? 'Completada' : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumen de la orden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                <p className="font-medium">{order?.customerName || 'Cliente'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Número de orden</h3>
                <p className="font-medium">{order?.orderNumber || 'No disponible'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fecha de creación</h3>
                <p className="font-medium">{formatDate(order?.createdAt || '')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Entrega estimada</h3>
                <p className="font-medium">
                  {formatDate(order?.deliveryDate || '')}
                </p>
                {!order?.deliveryDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    La estimación se actualizará cuando procesemos la orden.
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total</h3>
                <p className="font-medium">
                  {typeof order?.totalAmount === 'number' 
                    ? formatCurrency(order.totalAmount) 
                    : 'RD$ 0'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estado del pago</h3>
                <Badge className={paymentStatusColor}>
                  {paymentStatusLabel}
                </Badge>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = `tel:+1234567890`}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Contáctanos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 