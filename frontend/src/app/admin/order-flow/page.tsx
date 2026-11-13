'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, 
  Paper, Container, CircularProgress, Divider, Alert
} from '@mui/material';
import { toast } from 'react-toastify';
import OrderForm from '@/components/orders/OrderForm';
import PaymentForm, { PaymentMethod, PaymentStatus } from '@/components/payments/PaymentForm';
import PaymentConfirmation from '@/components/payments/PaymentConfirmation';

// Step definitions
const steps = ['Seleccionar cliente y servicio', 'Confirmar pedido', 'Procesar pago', 'Selesai'];

// Helper function al generate a payment reference number
const generateReferenceNumber = (orderId: string): string => {
  const timestamp = Date.now().toString().slice(-6); // Get last 6 digits of timestamp
  const orderIdShort = orderId.substring(0, 6); // Take first 6 characters of order ID
  return `REF-${orderIdShort}-${timestamp}`;
};

// Agregar this helper function at the top of the file, before the OrderFlow component
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'No disponible';
  
  try {
    // Try al parse the date
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

// Main Order Flow Component
export default function OrderFlow() {
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Order and payment data
  const [orderData, setOrderData] = useState<any>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  
  // Tambahkan log debugging dan error handling
  useEffect(() => {
    // Function al check service API
    const checkServiceAPI = async () => {
      try {
        // Use Siguiente.js API proxy instead of direct backend calls
        const response = await fetch(`/api/services?limit=1&page=1`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Service API error:', errorData);
        } else {
          const data = await response.json();
          console.log('Service API check successful, response:', data);
          
          // Validate response structure
          if (data.data && Array.isArray(data.data)) {
            console.log(`Service API returned ${data.data.length} services in data property`);
          } else if (data.items && Array.isArray(data.items)) {
            console.log(`Service API returned ${data.items.length} services in items property`);
          } else if (Array.isArray(data)) {
            console.log(`Service API returned ${data.length} services in array`);
          } else {
            console.error('Unexpected service API response format:', data);
          }
        }
      } catch (error) {
        console.error('Error checking service API:', error);
      }
    };
    
    checkServiceAPI();
  }, []);
  
  // Handler for OrderForm submission
  const handleOrderSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setOrderData(data);
    
    try {
      console.log('Original order data al submit:', data);
      
      // Proses item untuk memastikan format data yang benar
      const processedItems = data.items.map((item: any) => {
        // Check if this is a weight-based item
        const isWeightBased = 
          item.weightBased || 
          ['Dry Cleaning', 'Lavado expr?s', 'Lavado regular', 'Setrika'].includes(item.serviceName) ||
          [1, 2, 3, 4].includes(Number(item.serviceId));
        
        // Crear base item data
        const processedItem: any = {
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          quantity: item.quantity,
          price: item.price,
          weightBased: isWeightBased
        };
        
        // For weight-based items, add weight property properly
        if (isWeightBased) {
          // Use weight field if present, otherwise use quantity as weight
          processedItem.weight = item.weight !== undefined ? item.weight : item.quantity;
          console.log(`Weight-based item: ${item.serviceName}, Weight: ${processedItem.weight}kg, Precio: ${item.price}`);
          
          // For backend compatibility, we set a standard quantity of 1 for weight-based items
          // but preserve the actual weight in the weight field
          processedItem.quantity = 1;
        }
        
        return processedItem;
      });
      
      // Crear payload with processed items
      const payload = {
        customerId: data.customerId,
        items: processedItems,
        notes: data.notes || '',
        total: calculateTotal(processedItems)
      };
      
      console.log('Processed order payload:', JSON.stringify(payload));
      
      // Crear order in the backend using the Siguiente.js API proxy
      const response = await fetch(`/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fallido al create order');
      }
      
      const orderResult = await response.json();
      console.log('Creard order:', orderResult);
      
      // Check if the order data is nested under a 'data' property
      const orderData = orderResult.data || orderResult;
      setCreatedOrder(orderData);
      
      // Fetch customer details
      if (data.customerId) {
        console.log('Fetching customer details for ID:', data.customerId);
        const customerResponse = await fetch(`/api/customers/${data.customerId}`);
        
        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          console.log('Customer data fetched:', customerData);
          // Extract customer data from the response if needed
          setCustomer(customerData.data || customerData);
        } else {
          console.error('Fallido al fetch customer details');
          const errorData = await customerResponse.json();
          console.error(errorData);
        }
      }
      
      // Move al next step
      setActiveStep(1);
      toast.success('?El pedido se cre? correctamente!');
    } catch (error: any) {
      console.error('Error creating order:', error);
      setError(error.message || 'No se pudo crear el pedido');
      toast.error('No se pudo crear el pedido');
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for payment process
  const handlePaymentSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract only the necessary fields al avoid validation errors
      const paymentData = {
        orderId: createdOrder.id,
        amount: Number(data.amount || createdOrder.totalAmount || calculateTotal(createdOrder.items || [])),
        paymentMethod: data.paymentMethod,
        status: 'completed',
        notes: data.notes || '',
        transactionId: data.transactionId || '',
        referenceNumber: data.referenceNumber || generateReferenceNumber(createdOrder.id)
      };
      
      console.log('Payment data al submit:', paymentData);
      
      // Process payment in the backend using the Siguiente.js API proxy
      const response = await fetch(`/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment error response:', errorData);
        throw new Error(errorData.message || 'No se pudo procesar el pago');
      }
      
      const paymentResult = await response.json();
      console.log('Payment result:', paymentResult);
      const paymentResponseData = paymentResult.data || paymentResult;
      setPaymentData(paymentResponseData);
      
      // Move al final step
      setActiveStep(3);
      toast.success('?El pago se proces? correctamente!');
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setError(error.message || 'No se pudo procesar el pago');
      toast.error('No se pudo procesar el pago');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle next step
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Handle previous step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle reset al start over
  const handleReset = () => {
    setActiveStep(0);
    setOrderData(null);
    setCreatedOrder(null);
    setPaymentData(null);
    setCustomer(null);
    setError(null);
  };
  
  // Calculate order total
  const calculateTotal = (items: any[]) => {
    if (!items || !Array.isArray(items)) return 0;
    
    return items.reduce((total, item) => {
      console.log(`Calculating total for item: ${item.serviceName}`);
      
      // Determine if this is a weight-based item based on service priceModel
      const isWeightBased = item.service?.priceModel === 'per_kg';
      let actualQuantity = 0;
      
      if (isWeightBased) {
        if (item.weight !== undefined && item.weight !== null) {
          // Use explicit weight field if available
          actualQuantity = Number(item.weight);
          console.log(`Item ${item.serviceName} using weight field: ${actualQuantity}kg`);
        } else if (item.notes && item.notes.includes('Weight:')) {
          // Try al extract weight from notes
          const match = item.notes.match(/Weight: ([\d.]+) kg/);
          if (match && match[1]) {
            actualQuantity = parseFloat(match[1]);
            console.log(`Item ${item.serviceName} using weight from notes: ${actualQuantity}kg`);
          } else {
            // Default al existing quantity (no conversion/rounding)
            actualQuantity = Number(item.quantity) || 0.5;
            console.log(`Item ${item.serviceName} using quantity as weight: ${actualQuantity}kg`);
          }
        } else {
          // Default al existing quantity for weight-based items
          actualQuantity = Number(item.quantity) || 0.5; 
          console.log(`Item ${item.serviceName} using fallback weight: ${actualQuantity}kg`);
        }
      } else {
        // Non-weight based item, use quantity
        actualQuantity = Number(item.quantity) || 0;
        console.log(`Item ${item.serviceName} (piece-based) quantity: ${actualQuantity}`);
      }
      
      const price = Number(item.price) || 0;
      const subtotal = item.subtotal ? Number(item.subtotal) : (actualQuantity * price);
      
      console.log(`Item ${item.serviceName} subtotal: ${price} × ${actualQuantity} = ${subtotal}`);
      
      return total + subtotal;
    }, 0);
  };
  
  // Render current step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <OrderForm 
            onSubmit={handleOrderSubmit}
            onCancel={() => {}}
            isLoading={loading}
          />
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirmation del pedido
            </Typography>
            
            {createdOrder && (
              <Paper sx={{ p: 3, mb: 3 }}>
                {/* Order Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Detalles del pedido
                  </Typography>
                  <Typography variant="body2">
                    <strong>ID del pedido:</strong> {createdOrder.id || 'No disponible'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Number de pedido:</strong> {createdOrder.orderNumber || 'No disponible'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Estado:</strong> {createdOrder.status || 'No disponible'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tanggal:</strong> {formatDate(createdOrder.createdAt)}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Customer Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Detalles del cliente
                  </Typography>
                  {customer && (
                    <>
                      <Typography variant="body2">
                        <strong>Nama:</strong> {customer.name || 'No disponible'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Telepon:</strong> {customer.phone || 'No disponible'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Alamat:</strong> {customer.address || 'No disponible'}
                      </Typography>
                    </>
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Order Items */}
                <Typography variant="subtitle1" gutterBottom>
                  Artculos del pedido
                </Typography>
                {createdOrder.items && Array.isArray(createdOrder.items) && createdOrder.items.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Servicio</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Cantidad</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Precio</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {createdOrder.items.map((item: any, index: number) => {
                          // Determine if this is a weight-based item based on service priceModel
                          const isWeightBased = item.service?.priceModel === 'per_kg';
                          
                          // Determine display quantity and unit
                          let displayQuantity = item.quantity;
                          let unit = 'pcs';
                          
                          if (isWeightBased) {
                            if (item.weight !== undefined && item.weight !== null) {
                              displayQuantity = item.weight;
                            } else if (item.notes && item.notes.includes('Weight:')) {
                              const match = item.notes.match(/Weight: ([\d.]+) kg/);
                              if (match && match[1]) {
                                displayQuantity = parseFloat(match[1]);
                              }
                            }
                            unit = 'kg';
                          }
                          
                          // Calculate actual subtotal
                          const actualQuantity = isWeightBased ? displayQuantity : item.quantity;
                          const subtotal = (Number(actualQuantity) * Number(item.price));
                          
                          return (
                            <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '8px' }}>{item.serviceName}</td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>{displayQuantity} {unit}</td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>RD$ {Number(item.price).toLocaleString('es-DO')}</td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>RD$ {subtotal.toLocaleString('es-DO')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                            {createdOrder.totalAmount ? 
                              `RD$ ${Number(createdOrder.totalAmount).toLocaleString('es-DO')}` : 
                              `RD$ ${calculateTotal(createdOrder.items).toLocaleString('es-DO')}`}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </Box>
                )}
                
                {!createdOrder.items || !Array.isArray(createdOrder.items) || createdOrder.items.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Tidak ada item yang ditambahkan
                  </Typography>
                )}
                
                {createdOrder.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Catatan
                    </Typography>
                    <Typography variant="body2">
                      {createdOrder.notes}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack} disabled={loading}>
                Volver
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNext}
                disabled={loading}
              >
                Continuar al pago
              </Button>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Procesar pago
            </Typography>
            
            <PaymentForm
              orderId={createdOrder?.id || ''}
              orderAmount={createdOrder?.totalAmount || calculateTotal(createdOrder?.items || [])}
              customerId={customer?.id || ''}
              onSubmit={handlePaymentSubmit}
              onCancel={handleBack}
              isLoading={loading}
            />
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pedido completado
            </Typography>
            
            {paymentData && (
              <PaymentConfirmation
                payment={paymentData}
                orderDetails={{
                  orderNumber: createdOrder?.orderNumber || createdOrder?.id?.substring(0, 8).toUpperCase() || 'No disponible',
                  customerName: customer?.name || 'No disponible',
                  total: createdOrder?.totalAmount || calculateTotal(createdOrder?.items || [])
                }}
              />
            )}
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleReset}
              >
                Crear otro pedido
              </Button>
            </Box>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Proses Pedido Laundry
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading && activeStep !== 0 ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          getStepContent(activeStep)
        )}
      </Paper>
    </Container>
  );
} 