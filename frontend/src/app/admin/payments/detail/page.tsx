'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  Breadcrumbs,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  Send as SendIcon,
  AttachMoney as MoneyIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ArrowLeft
} from '@mui/icons-material';
import Link from 'next/link';

// Data dummy untuk detail pembayaran
const paymentData = {
  id: 'b9c32de7-1c29-4cd9-8168-57a05ca93f10',
  orderId: 'ORD-001234',
  customerId: 'CUST789',
  customerName: 'Budi Santoso',
  customerPhone: '081234567890',
  customerEmail: 'budi.santoso@email.com',
  amount: 125000,
  method: 'cash',
  status: 'completed',
  date: '2023-03-20T15:30:00',
  notes: 'Pembayaran tunai saat pengambilan',
  reference: null,
  details: {
    subtotal: 115000,
    tax: 10000,
    discount: 0,
    additionalFees: 0
  },
  createdBy: 'Administrador Rini',
  history: [
    { status: 'pending', timestamp: '2023-03-20T14:30:00', note: 'Pesanan dibuat' },
    { status: 'completed', timestamp: '2023-03-20T15:30:00', note: 'Pembayaran tunai diterima' }
  ]
};

// Fungsi untuk mendapatkan icon status pembayaran
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon fontSize="small" color="success" />;
    case 'pending':
      return <WarningIcon fontSize="small" color="warning" />;
    case 'failed':
      return <ErrorIcon fontSize="small" color="error" />;
    default:
      return null;
  }
};

// Fungsi untuk mendapatkan badge status pembayaran
const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return { color: 'success' as const, label: 'Completado' };
    case 'pending':
      return { color: 'warning' as const, label: 'Pendiente' };
    case 'failed':
      return { color: 'error' as const, label: 'Gagal' };
    default:
      return { color: 'default' as const, label: 'Tidak Diketahui' };
  }
};

// Fungsi untuk mendapatkan informasi metode pembayaran
const getPaymentMethodInfo = (method: string) => {
  switch (method) {
    case 'cash':
      return { label: 'Efectivo', color: 'primary' as const };
    case 'transfer':
      return { label: 'Transferencia bancaria', color: 'info' as const };
    case 'e-wallet':
      return { label: 'Billetera electr?nica', color: 'secondary' as const };
    default:
      return { label: 'Lainnya', color: 'default' as const };
  }
};

export default function PaymentDetailPage() {
  const payment = paymentData;
  const statusBadge = getPaymentStatusBadge(payment.status);
  const methodInfo = getPaymentMethodInfo(payment.method);
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link href="/admin/payments">
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon sx={{ mr: 0.5, fontSize: 18 }} />
                Volver ke Daftar Pembayaran
              </Typography>
            </Link>
            <Typography color="text.primary">Detail Transaksi</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Transaksi #{payment.id}
                <Chip 
                  label={statusBadge.label} 
                  color={statusBadge.color} 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tanggal Transaksi: {new Date(payment.date).toLocaleDateString('es-DO', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <Button 
                startIcon={<PrintIcon />} 
                variant="outlined" 
                size="small"
              >
                Cetak Kuitansi
              </Button>
              <Button 
                startIcon={<SendIcon />} 
                variant="outlined" 
                size="small"
              >
                Kirim Kuitansi
              </Button>
            </Stack>
          </Box>
        </Box>
        
        {payment.status === 'pending' && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small">
                Konfirmasi Pembayaran
              </Button>
            }
          >
            Pembayaran ini masih tertunda. Pendiente konfirmasi pembayaran.
          </Alert>
        )}
        
        {payment.status === 'failed' && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small">
                Coba Lagi
              </Button>
            }
          >
            Pembayaran ini gagal. Silakan coba lagi atau gunakan metode pembayaran lain.
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detail Pembayaran
              </Typography>
              <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      ID Transaksi
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {payment.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      M?todo de pago
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Chip 
                        size="small" 
                        label={methodInfo.label}
                        color={methodInfo.color}
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Estado
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Chip 
                        size="small" 
                        label={statusBadge.label} 
                        color={statusBadge.color}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tanggal Transaksi
                    </Typography>
                    <Typography variant="body1">
                      {new Date(payment.date).toLocaleDateString('es-DO', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Rincian Cantidad
                </Typography>
                <List dense disablePadding>
                  <ListItem
                    disableGutters
                    secondaryAction={
                      <Typography variant="body1">
                        RD$ {payment.details.subtotal.toLocaleString('es-DO')}
                      </Typography>
                    }
                  >
                    <ListItemText primary="Subtotal" />
                  </ListItem>
                  {payment.details.discount > 0 && (
                    <ListItem
                      disableGutters
                      secondaryAction={
                        <Typography variant="body1" color="error">
                          -RD$ {payment.details.discount.toLocaleString('es-DO')}
                        </Typography>
                      }
                    >
                      <ListItemText primary="Diskon" />
                    </ListItem>
                  )}
                  {payment.details.additionalFees > 0 && (
                    <ListItem
                      disableGutters
                      secondaryAction={
                        <Typography variant="body1">
                          RD$ {payment.details.additionalFees.toLocaleString('es-DO')}
                        </Typography>
                      }
                    >
                      <ListItemText primary="Biaya Tambahan" />
                    </ListItem>
                  )}
                  <ListItem
                    disableGutters
                    secondaryAction={
                      <Typography variant="body1">
                        RD$ {payment.details.tax.toLocaleString('es-DO')}
                      </Typography>
                    }
                  >
                    <ListItemText primary="Pajak" />
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                  <ListItem
                    disableGutters
                    secondaryAction={
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        RD$ {payment.amount.toLocaleString('es-DO')}
                      </Typography>
                    }
                  >
                    <ListItemText 
                      primary={<Typography variant="subtitle1" fontWeight="bold">Total</Typography>} 
                    />
                  </ListItem>
                </List>
              </Box>
              
              {payment.notes && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Catatan
                  </Typography>
                  <Typography variant="body1" sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    {payment.notes}
                  </Typography>
                </Box>
              )}
            </Paper>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Riwayat Estado
              </Typography>
              <List dense>
                {payment.history.map((history, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getStatusIcon(history.status)}
                            <Typography variant="body2" fontWeight="medium" sx={{ ml: 1 }}>
                              {getPaymentStatusBadge(history.status).label}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(history.timestamp).toLocaleDateString('es-DO', { 
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      }
                      secondary={history.note}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informasi Pesanan
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID del pedido
                </Typography>
                <Typography variant="body1">
                  <Link href={`/admin/orders/detail?id=${payment.orderId}`} style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'primary.main'
                  }}>
                    {payment.orderId}
                    <LinkIcon sx={{ ml: 0.5, fontSize: 16 }} />
                  </Link>
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Tindakan
              </Typography>
              <Stack spacing={1}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<ReceiptIcon />}
                  component={Link}
                  href={`/admin/orders/detail?id=${payment.orderId}`}
                >
                  Lihat Detalles del pedido
                </Button>
              </Stack>
            </Paper>
            
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Information del cliente
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nombre del cliente
                </Typography>
                <Typography variant="body1">
                  <Link href={`/admin/customers/detail?id=${payment.customerId}`} style={{ 
                    textDecoration: 'none',
                    color: 'inherit'
                  }}>
                    {payment.customerName}
                  </Link>
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1">
                  {payment.customerEmail}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Telepon
                </Typography>
                <Typography variant="body1">
                  {payment.customerPhone}
                </Typography>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Otra informaci?n
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Dibuat Oleh
                </Typography>
                <Typography variant="body1">
                  {payment.createdBy}
                </Typography>
              </Box>
              
              {payment.reference && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Referensi
                  </Typography>
                  <Typography variant="body1">
                    {payment.reference}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/admin/payments"
          >
            Volver ke Daftar
          </Button>
          
          {payment.status === 'pending' && (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<MoneyIcon />}
            >
              Konfirmasi Pembayaran
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
} 