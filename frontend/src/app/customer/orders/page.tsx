'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TablePagination,
  Chip,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon 
} from '@mui/icons-material';
import Link from 'next/link';
import { OrderService } from '@/services/order.service';
import { useOrders, useCancelOrder } from '@/services/useOrderQuery';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  items: number;
  total: number;
  paymentStatus: string;
}

// Sample data
const sampleOrders: Order[] = [
  { 
    id: 'ord-001', 
    orderNumber: 'ORD-12345', 
    date: '2023-04-01', 
    status: 'Dalam Proses', 
    items: 3, 
    total: 75000, 
    paymentStatus: 'Lunas' 
  },
  { 
    id: 'ord-002', 
    orderNumber: 'ORD-12346', 
    date: '2023-03-25', 
    status: 'Siap Diambil', 
    items: 2, 
    total: 45000, 
    paymentStatus: 'Lunas' 
  },
  { 
    id: 'ord-003', 
    orderNumber: 'ORD-12347', 
    date: '2023-03-20', 
    status: 'Selesai', 
    items: 5, 
    total: 120000, 
    paymentStatus: 'Lunas' 
  },
  { 
    id: 'ord-004', 
    orderNumber: 'ORD-12348', 
    date: '2023-03-15', 
    status: 'Dibatalkan', 
    items: 1, 
    total: 35000, 
    paymentStatus: 'Dikembalikan' 
  },
  { 
    id: 'ord-005', 
    orderNumber: 'ORD-12349', 
    date: '2023-03-10', 
    status: 'Selesai', 
    items: 4, 
    total: 95000, 
    paymentStatus: 'Lunas' 
  },
  { 
    id: 'ord-006', 
    orderNumber: 'ORD-12350', 
    date: '2023-03-05', 
    status: 'Selesai', 
    items: 2, 
    total: 50000, 
    paymentStatus: 'Lunas' 
  },
  { 
    id: 'ord-007', 
    orderNumber: 'ORD-12351', 
    date: '2023-02-28', 
    status: 'Selesai', 
    items: 3, 
    total: 65000, 
    paymentStatus: 'Lunas' 
  },
];

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Use React Query hook for fetching orders
  const {
    data: ordersResponse,
    isLoading,
    isError,
    error
  } = useOrders(page, rowsPerPage, tabValue !== 0 ? String(tabValue) : undefined);
  
  // Extract orders data and pagination info from response
  const ordersData = ordersResponse?.data?.items || [];
  const totalItems = ordersResponse?.data?.total || 0;
  
  // Use mutation for cancelling orders
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Convert API statuses to UI labels
  const mapApiStatusToUiStatus = (apiStatus: string): string => {
    switch (apiStatus) {
      case 'new':
        return 'Nueva';
      case 'processing':
        return 'En proceso';
      case 'ready_for_pickup':
        return 'Lista para retirar';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  // Convert payment statuses
  const mapPaymentStatus = (order: any): string => {
    // Logika sederhana sesuai data yang tersedia
    return order.status === 'cancelled' ? 'Reembolsado' : 'Pagado';
  };

  // Count the items in an order
  const calculateTotalItems = (items: any[]): number => {
    return items ? items.length : 0;
  };

  // Format dates returned by the API
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      
      // Cek valid date
      if (isNaN(date.getTime())) {
        return 'Fecha no válida';
      }
      
      return date.toLocaleDateString('es-DO', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Nueva':
        return 'info';
      case 'En proceso':
        return 'primary';
      case 'Lista para retirar':
        return 'warning';
      case 'Completada':
        return 'success';
      case 'Cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Pagado':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Reembolsado':
        return 'error';
      default:
        return 'default';
    }
  };

  // Update untuk filteredOrders menggunakan data dari API
  const filteredOrders = ordersData.filter((order: any) => {
    if (!order) return false;
    
    // Konversi status API ke status UI
    const uiStatus = mapApiStatusToUiStatus(order.status || 'unknown');
    
    // Filter by tab value
    if (tabValue === 1 && uiStatus !== 'En proceso') return false;
    if (tabValue === 2 && uiStatus !== 'Lista para retirar') return false;
    if (tabValue === 3 && uiStatus !== 'Completada') return false;
    
    // Filter by search term
    if (searchTerm && order.orderNumber && !order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Update cancel order handler
  const handleCancelOrder = (orderId: string) => {
    setOpenConfirmDialog(false);
    
    if (!selectedOrderId) return;
    
    cancelOrder(orderId, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'La orden se canceló correctamente.',
          severity: 'success'
        });
      },
      onError: (error: Error) => {
        setSnackbar({
          open: true,
          message: error.message || 'No se pudo cancelar la orden.',
          severity: 'error'
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh" flexDirection="column">
        <Typography color="error" gutterBottom>No se pudieron cargar las órdenes.</Typography>
        <Typography variant="body2">{error?.message || 'Inténtalo de nuevo más tarde.'}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis órdenes
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Consulta y administra tus órdenes de lavandería.
        </Typography>
      </Box>

      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <TextField
          placeholder="Buscar órdenes..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', sm: '300px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <Button 
          variant="contained" 
          component={Link} 
          href="/customer/orders/new"
          color="primary"
        >
          Nueva orden
        </Button>
      </Box>

      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Todas" />
          <Tab label="En proceso" />
          <Tab label="Lista para retirar" />
          <Tab label="Completadas" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>N.º de orden</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Artículos</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pago</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders
                .map((order: any) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Link href={`/customer/orders/${order.id}`} style={{ textDecoration: 'none', color: 'primary' }}>
                      <Typography variant="body2" color="primary" fontWeight={500}>
                        {order.orderNumber}
                      </Typography>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <CalendarIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                      <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{calculateTotalItems(order.items)}</TableCell>
                  <TableCell>{new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(parseFloat(order.totalAmount))}</TableCell>
                  <TableCell>
                    <Chip 
                      label={mapApiStatusToUiStatus(order.status)} 
                      size="small" 
                      color={getStatusColor(mapApiStatusToUiStatus(order.status)) as any} 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={mapPaymentStatus(order)} 
                      size="small" 
                      variant="outlined"
                      color={getPaymentStatusColor(mapPaymentStatus(order)) as any} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      component={Link} 
                      href={`/customer/orders/${order.id}`}
                      variant="text" 
                      size="small"
                    >
                      Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">No se encontraron órdenes.</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {tabValue === 0 
                        ? 'Todavía no tienes órdenes. ¡Crea una nueva ahora!' 
                        : 'No hay órdenes que coincidan con el filtro seleccionado.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
    </Box>
  );
} 