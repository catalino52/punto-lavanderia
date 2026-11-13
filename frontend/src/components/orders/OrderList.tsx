import { Box, Button, TableCell, Table, TableHead, TableBody, TableRow, Paper, TableContainer, Chip } from '@mui/material';
import Link from 'next/link';

interface Order {
  id: string;
  status: string;
  customerId: string;
  customerName?: string;
  total: number;
  created_at: string;
}

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id.substring(0, 8)}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>
                <Chip label={order.status} color="primary" size="small" />
              </TableCell>
              <TableCell>{new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(order.total)}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString('es-DO')}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    href={`/orders/${order.id}`}
                  >
                    Ver
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    component={Link}
                    href={`/orders/${order.id}/payment`}
                  >
                    Pagar ahora
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ... rest of the component 