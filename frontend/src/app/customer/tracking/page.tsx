'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Search as SearchIcon,
  LocalLaundryService as LaundryIcon,
  Inventory as InventoryIcon,
  Wash as WashIcon,
  Dry as DryIcon,
  Iron as IronIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { OrderService, TrackOrderResponse } from '@/services/order.service';
import { useTrackOrder } from '@/services/useOrderQuery';

// Sample order status data for fallback
const orderStatuses: Record<string, {
  orderNumber: string;
  customerName: string;
  date: string;
  items: number;
  totalAmount: number;
  status: string;
  estimatedCompletion: string;
  currentStep: number;
  timeline: {
    status: string;
    date: string;
    description: string;
    isCompleted: boolean;
  }[];
}> = {
  'ORD-12345': {
    orderNumber: 'ORD-12345',
    customerName: 'John Doe',
    date: '2023-04-01',
    items: 3,
    totalAmount: 75000,
    status: 'En proceso',
    estimatedCompletion: '2023-04-05',
    currentStep: 2,
    timeline: [
      {
        status: 'Orden recibida',
        date: '2023-04-01 10:30',
        description: 'Recibimos tu orden y está pendiente de recogida.',
        isCompleted: true
      },
      {
        status: 'Recogida',
        date: '2023-04-01 14:45',
        description: 'Nuestro mensajero recogió tu ropa.',
        isCompleted: true
      },
      {
        status: 'Lavado',
        date: '2023-04-02 09:15',
        description: 'Estamos lavando tu ropa.',
        isCompleted: true
      },
      {
        status: 'Secado',
        date: '2023-04-02 13:30',
        description: 'Estamos secando tu ropa.',
        isCompleted: false
      },
      {
        status: 'Planchado',
        date: '',
        description: 'Estamos planchando tu ropa.',
        isCompleted: false
      },
      {
        status: 'Entrega',
        date: '',
        description: 'Tu ropa está en proceso de entrega.',
        isCompleted: false
      },
      {
        status: 'Completada',
        date: '',
        description: 'Tu orden fue completada y entregada.',
        isCompleted: false
      }
    ]
  },
  'ORD-12346': {
    orderNumber: 'ORD-12346',
    customerName: 'Jane Smith',
    date: '2023-03-25',
    items: 2,
    totalAmount: 45000,
    status: 'Siap Diambil',
    estimatedCompletion: '2023-03-30',
    currentStep: 5,
    timeline: [
      {
        status: 'Orden recibida',
        date: '2023-03-25 09:30',
        description: 'Recibimos tu orden y está pendiente de recogida.',
        isCompleted: true
      },
      {
        status: 'Recogida',
        date: '2023-03-25 13:15',
        description: 'Nuestro mensajero recogió tu ropa.',
        isCompleted: true
      },
      {
        status: 'Lavado',
        date: '2023-03-26 10:30',
        description: 'Estamos lavando tu ropa.',
        isCompleted: true
      },
      {
        status: 'Secado',
        date: '2023-03-27 09:45',
        description: 'Estamos secando tu ropa.',
        isCompleted: true
      },
      {
        status: 'Planchado',
        date: '2023-03-28 11:30',
        description: 'Estamos planchando tu ropa.',
        isCompleted: true
      },
      {
        status: 'Entrega',
        date: '2023-03-29 14:00',
        description: 'Tu ropa está lista para retirar en nuestro local.',
        isCompleted: true
      },
      {
        status: 'Completada',
        date: '',
        description: 'Tu orden fue completada y entregada.',
        isCompleted: false
      }
    ]
  }
};

// Map backend order status to UI status
const mapOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'new': 'Orden recibida',
    'confirmed': 'Confirmada',
    'pickup_scheduled': 'Recogida programada',
    'picked_up': 'Recogida',
    'processing': 'En proceso',
    'cleaned': 'Lavada',
    'ready_for_delivery': 'Lista para entregar',
    'out_for_delivery': 'En camino',
    'delivered': 'Entregada',
    'completed': 'Completada',
    'cancelled': 'Cancelada'
  };

  return statusMap[status] || status;
};

// Map backend order status to timeline step
const mapOrderStatusToStep = (status: string, subStatus?: string): number => {
  if (status === 'cancelled') {
    return -1; // Special case for cancelled orders
  }
  
  // For new orders
  if (status === 'new' || status === 'confirmed') {
    return 0;
  }
  
  // For processing orders, use sub-status if available
  if (status === 'processing') {
    if (!subStatus) return 1; // Default to first processing step
    
    switch (subStatus) {
      case 'pickup': return 1;
      case 'washing': return 2;
      case 'drying': return 3;
      case 'ironing': return 4;
      case 'delivery': return 5;
      default: return 1;
    }
  }
  
  // For ready for pickup
  if (status === 'ready_for_pickup') {
    return 6;
  }
  
  // For completed orders
  if (status === 'completed' || status === 'delivered') {
    return 7;
  }
  
  // Default fallback
  return 0;
};

// Generate timeline from order status
const generateTimeline = (order: TrackOrderResponse): {
  status: string;
  date: string;
  description: string;
  isCompleted: boolean;
}[] => {
  // Complete list of all possible statuses in order
  const allStatuses = [
    { 
      status: 'new', 
      label: 'Orden recibida', 
      description: 'Recibimos tu orden y está pendiente de recogida.'
    },
    { 
      status: 'pickup', 
      label: 'Recogida', 
      description: 'Nuestro mensajero recogió tu ropa.'
    },
    { 
      status: 'washing', 
      label: 'Lavado', 
      description: 'Estamos lavando tu ropa.'
    },
    { 
      status: 'drying', 
      label: 'Secado', 
      description: 'Estamos secando tu ropa.'
    },
    { 
      status: 'ironing', 
      label: 'Planchado', 
      description: 'Estamos planchando tu ropa.'
    },
    { 
      status: 'delivery', 
      label: 'Entrega', 
      description: 'Tu ropa está en proceso de entrega.'
    },
    { 
      status: 'ready_for_pickup', 
      label: 'Lista para retirar', 
      description: 'Tu ropa está lista para retirar.'
    },
    { 
      status: 'completed', 
      label: 'Completada', 
      description: 'Tu orden fue completada y entregada.'
    }
  ];
  
  // Map API main and sub-status to our detailed timeline
  let currentMainStatus = order.status;
  let currentSubStatus = order.subStatus || '';
  
  // Determine which steps should be active based on main and sub-status
  let activeStatusIndex = -1;
  
  if (currentMainStatus === 'new' || currentMainStatus === 'confirmed') {
    activeStatusIndex = 0; // Pesanan Diterima
  } else if (currentMainStatus === 'processing') {
    // For processing, look at the sub-status to determine the exact step
    switch (currentSubStatus) {
      case 'pickup':
        activeStatusIndex = 1; // Pengambilan
        break;
      case 'washing':
        activeStatusIndex = 2; // Pencucian
        break;
      case 'drying':
        activeStatusIndex = 3; // Pengeringan
        break;
      case 'ironing':
        activeStatusIndex = 4; // Setrika
        break;
      case 'delivery':
        activeStatusIndex = 5; // Pengiriman
        break;
      default:
        activeStatusIndex = 1; // Default to first processing step if sub-status not specified
    }
  } else if (currentMainStatus === 'ready_for_pickup') {
    activeStatusIndex = 6; // Siap Diambil
  } else if (currentMainStatus === 'completed' || currentMainStatus === 'delivered') {
    activeStatusIndex = 7; // Selesai
  }
  
  // Helper function to get timestamp for a specific status
  function getStatusTimestamp(status: string): string {
    if (status === 'new') return order.createdAt || '';
    if (status === 'pickup') return order.pickupAt || '';
    if (status === 'washing') return order.washingAt || '';
    if (status === 'drying') return order.dryingAt || '';
    if (status === 'ironing') return order.ironingAt || '';
    if (status === 'delivery') return order.deliveryAt || '';
    if (status === 'ready_for_pickup') return order.readyForPickupAt || '';
    if (status === 'completed') return order.completedAt || '';
    return '';
  }
  
  // If order is cancelled, handle specially
  if (currentMainStatus === 'cancelled') {
    // Find at what step it was cancelled based on the sub-status if available
    const lastActiveStatus = currentSubStatus || 'new';
    const lastActiveIndex = Math.max(
      0, 
      allStatuses.findIndex(s => s.status === lastActiveStatus)
    );
    
    // Create timeline with only active statuses up to cancellation point
    const timeline = allStatuses.slice(0, lastActiveIndex + 1).map((status, index) => ({
      status: status.label,
      date: getStatusTimestamp(status.status) 
        ? new Date(getStatusTimestamp(status.status)).toLocaleString('es-DO') 
        : '',
      description: status.description,
      isCompleted: true
    }));
    
    // Add the cancelled status
    timeline.push({
      status: 'Orden cancelada',
      date: order.updatedAt 
        ? new Date(order.updatedAt).toLocaleString('es-DO') 
        : '',
      description: 'La orden fue cancelada.',
      isCompleted: true
    });
    
    return timeline;
  }
  
  // For normal orders, create the timeline
  return allStatuses.map((status, index) => ({
    status: status.label,
    date: index <= activeStatusIndex && getStatusTimestamp(status.status)
      ? new Date(getStatusTimestamp(status.status)).toLocaleString('es-DO')
      : '',
    description: status.description,
    isCompleted: index <= activeStatusIndex
  }));
};

// Step icons for the stepper
const stepIcons = [
  <LaundryIcon key="order" />,
  <InventoryIcon key="pickup" />,
  <WashIcon key="wash" />,
  <DryIcon key="dry" />,
  <IronIcon key="iron" />,
  <ShippingIcon key="delivery" />,
  <ShippingIcon key="ready" />,
  <CheckCircleIcon key="complete" />
];

// Step labels for the stepper
const stepLabels = [
  'Orden recibida',
  'Recogida',
  'Lavado',
  'Secado',
  'Planchado',
  'Entrega',
  'Lista para retirar',
  'Completada'
];

export default function CustomerTracking() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  
  // Use React Query hook for tracking order
  const {
    data: orderResult,
    isLoading,
    isError,
    error,
    refetch
  } = useTrackOrder(searched ? searchQuery : '');
  
  // Map backend data to display format after receiving it
  const orderData = orderResult ? {
    orderNumber: orderResult.orderNumber,
    customerName: orderResult.customerName,
    date: new Date(orderResult.createdAt).toLocaleDateString('es-DO'),
    items: orderResult.items?.length || 0,
    totalAmount: orderResult.totalAmount,
    status: mapOrderStatus(orderResult.status),
    estimatedCompletion: orderResult.deliveryDate 
      ? new Date(orderResult.deliveryDate).toLocaleDateString('es-DO')
      : 'En proceso',
    currentStep: mapOrderStatusToStep(orderResult.status, orderResult.subStatus),
    timeline: generateTimeline(orderResult)
  } : null;
  
  // Initiate search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return;
    }
    
    setSearched(true);
    // The refetch will happen automatically due to the useTrackOrder dependency
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En proceso':
        return theme.palette.info.main;
      case 'Lista para retirar':
        return theme.palette.warning.main;
      case 'Completada':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dar seguimiento a una orden
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Consulta el estado y el recorrido de tu orden de lavandería.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Ingresa el número de orden
        </Typography>
        
        <Box 
          display="flex" 
          alignItems="center" 
          gap={2} 
          sx={{ 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: { xs: 'stretch', sm: 'center' } 
          }}
        >
          <TextField
            fullWidth
            placeholder="Ej.: ORD-12345"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={isLoading}
            sx={{ 
              minWidth: '120px',
              height: '56px'
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Buscar'}
          </Button>
        </Box>
        
        {isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error instanceof Error ? error.message : error}
          </Alert>
        )}
        
        {searched && !orderData && !isLoading && !isError && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No encontramos la orden. Verifica el número e inténtalo de nuevo.
          </Alert>
        )}
      </Paper>

      {orderData && (
        <>
          <Typography variant="h6" component="h2" gutterBottom>
            Detalles de la orden
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Número de orden
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {orderData.orderNumber}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Fecha de la orden
                      </Typography>
                      <Typography variant="body2">
                        {orderData.date}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Artículos
                      </Typography>
                      <Typography variant="body2">
                        {orderData.items} artículos
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Total
                      </Typography>
                      <Typography variant="body2">
                        RD$ {orderData.totalAmount.toLocaleString('es-DO')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Status
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: getStatusColor(orderData.status),
                          fontWeight: 'bold'
                        }}
                      >
                        {orderData.status}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Finalización estimada
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                        {orderData.estimatedCompletion}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
                  Estado del servicio
                </Typography>
                
                <Stepper 
                  activeStep={orderData.currentStep} 
                  alternativeLabel
                  sx={{ 
                    mb: 4,
                    "& .MuiStepConnector-line": {
                      minHeight: 20
                    }
                  }}
                >
                  {stepLabels.map((label, index) => (
                    <Step key={label}>
                      <StepLabel 
                        StepIconComponent={() => (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: index <= orderData.currentStep 
                                ? (orderData.currentStep === -1 ? theme.palette.error.main : theme.palette.primary.main) 
                                : theme.palette.grey[300],
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              color: index <= orderData.currentStep 
                                ? 'white' 
                                : theme.palette.text.secondary,
                            }}
                          >
                            {React.cloneElement(stepIcons[index], { fontSize: 'small' })}
                          </Box>
                        )}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Historial de estados
                </Typography>
                
                <Timeline position="right" sx={{ p: 0, m: 0 }}>
                  {orderData.timeline.map((item: any, index: number) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent 
                        sx={{ 
                          maxWidth: '150px', 
                          flex: 'none', 
                          pt: 0,
                          color: item.isCompleted ? 'text.secondary' : 'text.disabled',
                          fontSize: '0.75rem'
                        }}
                      >
                        {item.date || '-'}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot 
                          color={item.status === 'Orden cancelada' ? 'error' : (item.isCompleted ? 'primary' : 'grey')} 
                          variant={item.isCompleted ? 'filled' : 'outlined'}
                        />
                        {index < orderData.timeline.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent 
                        sx={{ 
                          pt: 0,
                          pb: index < orderData.timeline.length - 1 ? 3 : 0
                        }}
                      >
                        <Typography 
                          variant="subtitle2" 
                          component="span" 
                          sx={{ 
                            color: item.status === 'Orden cancelada' 
                              ? theme.palette.error.main 
                              : (item.isCompleted ? 'text.primary' : 'text.disabled'),
                            fontWeight: item.isCompleted ? 'bold' : 'regular'
                          }}
                        >
                          {item.status}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: item.isCompleted ? 'text.secondary' : 'text.disabled'
                          }}
                        >
                          {item.description}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Paper>
            </Grid>
          </Grid>
          
          <Box mt={4} display="flex" justifyContent="center">
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                href="/customer/orders" 
                sx={{ minWidth: '150px' }}
              >
                Ver todas las órdenes
              </Button>
              <Button 
                variant="contained" 
                href={`/customer/orders/${orderData.orderNumber}`}
                sx={{ minWidth: '150px' }}
              >
                Detalles de la orden
              </Button>
            </Stack>
          </Box>
        </>
      )}
      
      {!orderData && !isLoading && (
        <Paper 
          sx={{ 
            p: 4, 
            mt: 4, 
            borderRadius: 2, 
            textAlign: 'center',
            bgcolor: 'background.default',
            border: 1,
            borderColor: 'divider'
          }}
        >
          <LaundryIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Todavía no hay órdenes en seguimiento.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Ingresa el número de orden arriba para consultar su estado y recorrido.
            También puedes ver todas tus órdenes en la página de órdenes.
          </Typography>
          <Button
            variant="contained"
            href="/customer/orders"
          >
            Ver mis órdenes
          </Button>
        </Paper>
      )}
    </Box>
  );
} 