'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Box,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { PaymentFilter } from '@/types/payment';

interface PaymentFilterFormProps {
  initialValues?: PaymentFilter;
  onSubmit: (filter: PaymentFilter) => void;
}

export default function PaymentFilterForm({ initialValues, onSubmit }: PaymentFilterFormProps) {
  const [filter, setFilter] = useState<PaymentFilter>(initialValues || {});

  // Update filter when initialValues change
  useEffect(() => {
    if (initialValues) {
      setFilter(initialValues);
    }
  }, [initialValues]);

  // Handle changes to filter values
  const handleStatusChange = (event: SelectChangeEvent) => {
    setFilter({ ...filter, status: event.target.value });
  };

  const handleMethodChange = (event: SelectChangeEvent) => {
    setFilter({ ...filter, paymentMethod: event.target.value });
  };

  const handleStartDateChange = (date: Date | null) => {
    setFilter({ ...filter, startDate: date ? date.toISOString().split('T')[0] : undefined });
  };

  const handleEndDateChange = (date: Date | null) => {
    setFilter({ ...filter, endDate: date ? date.toISOString().split('T')[0] : undefined });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(filter);
  };

  // Handle form reset
  const handleReset = () => {
    setFilter({});
    onSubmit({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="status-filter-label">Estado del pago</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filter.status || ''}
                label="Estado del pago"
                onChange={handleStatusChange}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                <MenuItem value="completed">Pagado</MenuItem>
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="failed">Fallido</MenuItem>
                <MenuItem value="refunded">Reembolsado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="method-filter-label">Método de pago</InputLabel>
              <Select
                labelId="method-filter-label"
                id="method-filter"
                value={filter.paymentMethod || ''}
                label="Método de pago"
                onChange={handleMethodChange}
              >
                <MenuItem value="">Todos los métodos</MenuItem>
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="bank_transfer">Transferencia bancaria</MenuItem>
                <MenuItem value="credit_card">Tarjeta de crédito</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Fecha de inicio"
              value={filter.startDate ? new Date(filter.startDate) : null}
              onChange={handleStartDateChange}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Fecha de fin"
              value={filter.endDate ? new Date(filter.endDate) : null}
              onChange={handleEndDateChange}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                type="submit"
              >
                Terapkan Filter
              </Button>
            </Box>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </form>
  );
} 