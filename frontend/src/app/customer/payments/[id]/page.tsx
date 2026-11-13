'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Chip,
  Alert,
  Card,
  CardContent,
  IconButton,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  Receipt,
  AccountBalance,
  CreditCard,
  MonetizationOn,
  AccessTime,
  EventNote,
  CheckCircle,
  Cancel,
  Print,
  Launch
} from '@mui/icons-material';
import Link from 'next/link';
import { usePaymentDetails } from '@/services/usePaymentQuery';

// Utility functions
const getPaymentMethodDisplay = (method: string) => {
  switch (method?.toLowerCase()) {
    case 'cash':
      return { 
        text: 'Efectivo', 
        icon: <MonetizationOn fontSize="small" /> 
      };
    case 'transfer':
      return { 
        text: 'Transferencia bancaria', 
        icon: <AccountBalance fontSize="small" /> 
      };
    case 'credit_card':
    case 'credit':
    case 'debit_card':
    case 'debit':
      return { 
        text: 'Kartu', 
        icon: <CreditCard fontSize="small" /> 
      };
    default:
      return { 
        text: method || 'Desconocido', 
        icon: <Receipt fontSize="small" /> 
      };
  }
};

// Get status chip properties
const getStatusProperties = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'completed':
      return { 
        color: 'success', 
        text: 'Pagado', 
        icon: <CheckCircle fontSize="small" /> 
      };
    case 'pending':
      return { 
        color: 'warning', 
        text: 'Pendiente', 
        icon: <AccessTime fontSize="small" /> 
      };
    case 'cancelled':
    case 'failed':
      return { 
        color: 'error', 
        text: 'Fallido', 
        icon: <Cancel fontSize="small" /> 
      };
    case 'partial':
      return { 
        color: 'info', 
        text: 'Parcial', 
        icon: <Receipt fontSize="small" /> 
      };
    default:
      return { 
        color: 'default', 
        text: status || 'Desconocido', 
        icon: <Receipt fontSize="small" /> 
      };
  }
};

// Format date in Dominican Spanish
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format currency in Dominican pesos
const formatRupiah = (amount: number) => {
  if (!amount && amount !== 0) return 'RD$ 0';
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  // Use our custom hook with fixed implementation
  const { payment, isLoading, error, fetchPaymentDetails } = usePaymentDetails({ 
    id,
    autoFetch: true
  });
  
  // Additional state for direct API fallback
  const [directLoading, setDirectLoading] = useState(false);
  const [directPayment, setDirectPayment] = useState<any>(null);
  const [directError, setDirectError] = useState<string | null>(null);

  // If hook returns error, try direct API call as fallback
  useEffect(() => {
    if (error && !directLoading && !directPayment) {
      let isMounted = true;
      
      const fetchDirectly = async () => {
        try {
          setDirectLoading(true);
          console.log(`[PaymentDetailPage] Fetching payment directly: ${id}`);
          
          const response = await fetch(`/api/customers/payments/${id}`);
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log(`[PaymentDetailPage] Direct fetch success:`, data);
          
          if (isMounted) {
            setDirectPayment(data);
            setDirectError(null);
          }
        } catch (err) {
          console.error('[PaymentDetailPage] Direct fetch error:', err);
          if (isMounted) {
            setDirectError(err instanceof Error ? err.message : 'Failed to load payment details');
          }
        } finally {
          if (isMounted) {
            setDirectLoading(false);
          }
        }
      };
      
      fetchDirectly();
      
      return () => { isMounted = false; };
    }
  }, [error, id, directPayment]);

  // Handle go back
  const handleGoBack = () => {
    router.push('/customer/payments');
  };

  // Print payment receipt
  const handlePrint = () => {
    window.print();
  };

  const isLoadingAny = isLoading || directLoading;
  const hasError = (error && directError) || (error && !directPayment);
  const paymentData = payment || directPayment;

  // Loading state
  if (isLoadingAny) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Error state
  if (hasError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || directError || 'Ocurrió un error al cargar los detalles del pago.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
        >
          Volver a los pagos
        </Button>
      </Box>
    );
  }
  
  // No payment data
  if (!paymentData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          No se encontró el pago (ID: {id})
        </Alert>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
          >
            Volver a los pagos
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              console.log("Retry: Fetching payment", id);
              fetchPaymentDetails();
            }}
          >
            Intentar de nuevo
          </Button>
        </Stack>
      </Box>
    );
  }
  
  // Get payment status and method properties
  const statusProps = getStatusProperties(paymentData.status);
  const paymentMethodProps = getPaymentMethodDisplay(paymentData.paymentMethod);
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header & Navigation */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          Detalles del pago
        </Typography>
      </Box>
      
      {/* Print bar - Only visible when printing */}
      <Box 
        sx={{ 
          display: 'none', 
          '@media print': { 
            display: 'block',
            mb: 3,
            textAlign: 'center'
          }
        }}
      >
        <Typography variant="h5" gutterBottom>
          Comprobante de pago
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {paymentData.orderNumber || `ID de orden: ${paymentData.orderId}`}
        </Typography>
      </Box>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Payment Summary */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3, 
              position: 'relative',
              '@media print': {
                boxShadow: 'none',
                border: '1px solid #eee'
              }
            }}
          >
            {/* Action buttons - Hide when printing */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16,
                '@media print': { display: 'none' }
              }}
            >
              <IconButton onClick={handlePrint} size="small" title="Imprimir">
                <Print fontSize="small" />
              </IconButton>
            </Box>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Información del pago
              </Typography>
              <Chip
                icon={statusProps.icon}
                label={statusProps.text}
                color={statusProps.color as any}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID de pago
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {paymentData.id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Fecha y hora
                </Typography>
                <Typography variant="body1">
                  {formatDate(paymentData.createdAt)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Monto
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {formatRupiah(paymentData.amount)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Método de pago
                </Typography>
                <Box display="flex" alignItems="center">
                  {paymentMethodProps.icon}
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {paymentMethodProps.text}
                  </Typography>
                </Box>
                {paymentData.transactionId && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    ID Transaksi: {paymentData.transactionId}
                  </Typography>
                )}
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Detalles de la orden
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Número de orden
                  </Typography>
                  <Link 
                    href={`/customer/orders/${paymentData.orderId}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    <EventNote sx={{ mr: 1, fontSize: 18 }} color="primary" />
                    <Typography variant="body1" color="primary" fontWeight={500}>
                      {paymentData.orderNumber || `ID de orden: ${paymentData.orderId}`}
                    </Typography>
                  </Link>
                </Grid>
                
                {paymentData.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Nota
                    </Typography>
                    <Typography variant="body2">
                      {paymentData.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right Side Panel */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ mb: 3, '@media print': { display: 'none' } }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Acciones
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={handlePrint}
                  fullWidth
                >
                  Imprimir comprobante de pago
                </Button>
                
                <Button
                  variant="outlined"
                  component={Link}
                  href={`/customer/orders/${paymentData.orderId}`}
                  startIcon={<Launch />}
                  fullWidth
                >
                  Ver detalles de la orden
                </Button>
              </Stack>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ '@media print': { display: 'none' } }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Ayuda
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" paragraph>
                Si tienes preguntas sobre este pago, comunícate con nuestro servicio al cliente.
              </Typography>
              
              <Link href="/customer/help" style={{ textDecoration: 'none' }}>
                <Button
                  variant="text"
                  color="primary"
                  fullWidth
                >
                  Ayuda y preguntas frecuentes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Print footer - Only visible when printing */}
      <Box 
        sx={{ 
          display: 'none', 
          '@media print': { 
            display: 'block',
            mt: 4,
            pt: 2,
            borderTop: '1px solid #eee',
            textAlign: 'center'
          }
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Este comprobante se imprimió el {new Date().toLocaleString('es-DO')}. 
          Gracias por elegir nuestro servicio.
        </Typography>
      </Box>
    </Container>
  );
} 