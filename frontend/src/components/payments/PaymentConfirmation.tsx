'use client';

import {
  Box, Paper, Button, Typography,
  Card, CardContent, Grid, Divider,
  Chip
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { PaymentMethod, PaymentStatus } from './PaymentForm';

interface PaymentConfirmationProps {
  payment: {
    id: string;
    orderId: string;
    customerId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    notes?: string;
    transactionId?: string;
    created_at?: string;
    createdAt?: string;
    referenceNumber?: string;
  };
  orderDetails?: {
    orderNumber?: string;
    customerName?: string;
    total?: number;
  };
}

export default function PaymentConfirmation({ payment, orderDetails }: PaymentConfirmationProps) {
  const router = useRouter();
  
  // Format date to readable format with improved error handling
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'No disponible';
    
    try {
      // Try to parse the date
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'No disponible';
      }
      
      // Format the date as a locale string with fallback
      return date.toLocaleString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'No disponible';
    }
  };
  
  // Get payment method display text
  const getPaymentMethodText = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH: return 'Efectivo';
      case PaymentMethod.CREDIT_CARD: return 'Tarjeta de crédito';
      case PaymentMethod.DEBIT_CARD: return 'Tarjeta de débito';
      case PaymentMethod.TRANSFER: return 'Transferencia bancaria';
      case PaymentMethod.EWALLET: return 'Billetera digital';
      case PaymentMethod.OTHER: return 'Otro';
      default: return method;
    }
  };
  
  // Get status display
  const getStatusDisplay = (status: PaymentStatus) => {
    let color = 'default';
    switch (status) {
      case PaymentStatus.COMPLETED: 
        color = 'success';
        break;
      case PaymentStatus.PENDING: 
        color = 'warning';
        break;
      case PaymentStatus.FAILED: 
        color = 'error';
        break;
      case PaymentStatus.REFUNDED: 
        color = 'info';
        break;
      case PaymentStatus.CANCELLED: 
        color = 'default';
        break;
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        color={color as any} 
        variant="outlined" 
        size="small" 
      />
    );
  };
  
  // Get total amount with fallback and formatting
  const formatAmount = (amount?: number | null): string => {
    if (amount === undefined || amount === null) return 'RD$ 0';
    try {
      return `RD$ ${Number(amount).toLocaleString('es-DO')}`;
    } catch (error) {
      console.error('Error formatting amount:', error);
      return 'RD$ 0';
    }
  };
  
  const handleViewOrder = () => {
    router.push(`/orders/${payment.orderId}`);
  };
  
  const handlePrintReceipt = () => {
    window.print();
  };
  
  const handleBackToOrders = () => {
    router.push('/orders');
  };
  
  return (
    <Paper sx={{ p: 3, width: '100%', maxWidth: '800px', mx: 'auto' }} id="payment-receipt">
      <Box className="print-section">
        <Typography variant="h5" align="center" gutterBottom>
          Comprobante de pago
        </Typography>
        
        {/* Payment ID and Date */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              <strong>ID de pago:</strong> {payment.id}
            </Typography>
            <Typography variant="body2">
              <strong>Fecha:</strong> {formatDate(payment.createdAt || payment.created_at)}
            </Typography>
          </Box>
          {payment.referenceNumber && (
            <Typography variant="body2">
              <strong>N.º de referencia:</strong> {payment.referenceNumber}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Order and Customer Details */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Detalles de la orden
                </Typography>
                <Typography variant="body2">
                  <strong>ID de orden:</strong> {payment.orderId}
                </Typography>
                {orderDetails?.orderNumber && (
                  <Typography variant="body2">
                    <strong>N.º de orden:</strong> {orderDetails.orderNumber}
                  </Typography>
                )}
                {orderDetails?.total !== undefined && (
                  <Typography variant="body2">
                    <strong>Total de la orden:</strong> {formatAmount(orderDetails.total)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Datos del cliente
                </Typography>
                <Typography variant="body2">
                  <strong>ID de cliente:</strong> {payment.customerId}
                </Typography>
                {orderDetails?.customerName && (
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {orderDetails.customerName}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Payment Details */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Detalles del pago
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Monto:</strong> {formatAmount(payment.amount)}
                </Typography>
                <Typography variant="body2">
                  <strong>Método:</strong> {getPaymentMethodText(payment.method)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Estado:</strong> {getStatusDisplay(payment.status)}
                </Typography>
                {payment.transactionId && (
                  <Typography variant="body2">
                    <strong>ID de transacción:</strong> {payment.transactionId}
                  </Typography>
                )}
              </Grid>
              
              {payment.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Nota:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {payment.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Footer */}
        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
          ¡Gracias por elegirnos!
        </Typography>
      </Box>
      
      {/* Actions - not printed */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }} className="no-print">
        <Button variant="outlined" onClick={handleBackToOrders}>
          Volver a las órdenes
        </Button>
        <Button variant="outlined" onClick={handleViewOrder}>
          Ver orden
        </Button>
        <Button variant="contained" onClick={handlePrintReceipt}>
          Imprimir comprobante de pago
        </Button>
      </Box>
      
      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .no-print {
            display: none;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Paper>
  );
} 