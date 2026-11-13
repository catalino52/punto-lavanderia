'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Service {
  id: string;
  name: string;
  price: number;
  priceModel?: 'per_kg' | 'per_piece' | 'flat_rate';
}

interface OrderItem {
  serviceId?: string;
  id?: string;
  serviceName: string;
  quantity: number;
  price: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
  service?: Service;
}

interface OrderSummaryProps {
  customerName: string;
  items: OrderItem[];
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ customerName, items, total }) => {
  // Calculate total based on actual items
  const calculateTotal = () => {
    if (!items || !Array.isArray(items)) return 0;
    
    return items.reduce((sum, item) => {
      // Use the subtotal directly from each item
      return sum + item.subtotal;
    }, 0);
  };
  
  // Correct total based on items
  const actualTotal = calculateTotal();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Cliente</p>
        <p className="font-medium">{customerName || 'Cliente sin nombre'}</p>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="text-sm font-medium mb-2">Artículos de la orden</h4>
        
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No se han agregado artículos.
          </p>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead className="text-right">Cant./peso</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  // Determine if this is a weight-based item
                  const isWeightBased = item.service?.priceModel === 'per_kg' || item.weightBased;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{item.serviceName}</TableCell>
                      <TableCell className="text-right">
                        {isWeightBased && item.weight !== undefined
                          ? `${item.weight} kg`
                          : item.quantity
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        RD$ {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        RD$ {formatCurrency(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                  <TableCell className="text-right font-medium">
                    RD$ {formatCurrency(actualTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary; 