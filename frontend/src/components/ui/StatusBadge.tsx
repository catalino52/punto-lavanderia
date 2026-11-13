import React from 'react';
import { Chip, ChipProps } from '@mui/material';

// Mendefinisikan tipe status yang valid
export type StatusType = 'placed' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'on-hold';

// Props untuk komponen StatusBadge
interface StatusBadgeProps {
  status: StatusType;
  size?: ChipProps['size'];
}

// Komponen StatusBadge untuk menampilkan status pesanan dengan warna yang sesuai
export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  // Menentukan label berdasarkan status
  const getLabel = (): string => {
    switch (status) {
      case 'placed':
        return 'Orden recibida';
      case 'confirmed':
        return 'Confirmada';
      case 'processing':
        return 'En proceso';
      case 'ready':
        return 'Lista para retirar';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'on-hold':
        return 'En espera';
      default:
        return 'Estado desconocido';
    }
  };
  
  // Menentukan warna berdasarkan status
  const getColor = (): ChipProps['color'] => {
    switch (status) {
      case 'placed':
        return 'default';
      case 'confirmed':
        return 'primary';
      case 'processing':
        return 'info';
      case 'ready':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'on-hold':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <Chip
      label={getLabel()}
      color={getColor()}
      size={size}
      sx={{ 
        fontWeight: 500,
        minWidth: 80,
        textAlign: 'center'
      }}
    />
  );
} 