'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  InputAdornment,
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { createPayment, PaymentMethod, PaymentStatus } from '@/api/payments';
import PageHeader from '@/components/ui/PageHeader';

interface PaymentFormData {
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  notes?: string;
}

const validationSchema = yup.object().shape({
  orderId: yup.string().required('El identificador del pedido es obligatorio.'),
  method: yup.string().required('Selecciona un método de pago.'),
  status: yup.string().required('Selecciona el estado del pago.'),
  amount: yup.number()
    .required('El monto del pago es obligatorio.')
    .positive('El monto debe ser mayor que cero.'),
  transactionId: yup.string(),
  notes: yup.string()
});

export default function NewPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<PaymentFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      orderId: '',
      method: 'cash',
      status: 'pending',
      amount: 0,
      transactionId: '',
      notes: ''
    }
  });

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createPayment(data);
      setSuccess('El pago se registró correctamente.');
      reset();
      
      setTimeout(() => {
        router.push('/admin/payments');
      }, 2000);
    } catch (err: any) {
      console.error('Error al registrar el pago:', err);
      setError(err.response?.data?.message || 'Ocurrió un error al registrar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <PageHeader 
        title="Registrar pago"
        backButton
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="orderId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Identificador del pedido"
                    fullWidth
                    error={!!errors.orderId}
                    helperText={errors.orderId?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="method"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.method}>
                    <InputLabel id="payment-method-label">Método de pago</InputLabel>
                    <Select
                      {...field}
                      labelId="payment-method-label"
                      label="Método de pago"
                      disabled={loading}
                      required
                    >
                      <MenuItem value="cash">Efectivo</MenuItem>
                      <MenuItem value="credit_card">Tarjeta de crédito</MenuItem>
                      <MenuItem value="bank_transfer">Transferencia bancaria</MenuItem>
                      <MenuItem value="e_wallet">Billetera digital</MenuItem>
                    </Select>
                    {errors.method && (
                      <FormHelperText>{errors.method.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel id="payment-status-label">Estado del pago</InputLabel>
                    <Select
                      {...field}
                      labelId="payment-status-label"
                      label="Estado del pago"
                      disabled={loading}
                      required
                    >
                      <MenuItem value="pending">Pendiente</MenuItem>
                      <MenuItem value="completed">Completado</MenuItem>
                      <MenuItem value="failed">Fallido</MenuItem>
                      <MenuItem value="refunded">Reembolsado</MenuItem>
                    </Select>
                    {errors.status && (
                      <FormHelperText>{errors.status.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Monto del pago"
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">RD$</InputAdornment>,
                    }}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="transactionId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ID Transaksi (opsional)"
                    fullWidth
                    error={!!errors.transactionId}
                    helperText={errors.transactionId?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notas (opcional)"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/admin/payments')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar pago'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
} 