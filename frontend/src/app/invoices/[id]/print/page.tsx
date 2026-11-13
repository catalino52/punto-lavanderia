'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createAuthHeaders } from '@/lib/api-utils';
import { getOrderById } from '@/lib/orders';

interface OrderItem {
  serviceName: string;
  quantity: number;
  price: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: OrderItem[];
  total: number;
  notes?: string;
  createdAt: string;
  payments?: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    referenceNumber?: string;
  }>;
}

// Debug helper
const debugLog = (message: string, data: any = {}) => {
  console.log(`[InvoicePrint] ${message}`, data);
  try {
    // Log extra debug info in development
    if (process.env.NODE_ENV === 'development') {
      if (typeof window !== 'undefined') {
        (window as any).debugData = (window as any).debugData || [];
        (window as any).debugData.push({ message, data, timestamp: new Date() });
      }
    }
  } catch (e) {
    console.error('Debug logging error:', e);
  }
};

export default function InvoicePrintPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        const orderId = params.id as string;
        console.log('Fetching invoice data for order:', orderId);
        
        const response = await getOrderById(orderId);
        console.log('Invoice data received:', response);
        
        if (response && response.data) {
          setInvoice(response.data);
        } else {
          setError('No se recibieron los datos de la factura.');
        }
      } catch (err: any) {
        console.error('Error fetching invoice:', err);
        setError(err.message || 'No se pudo cargar la factura.');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          {error || 'No se encontró la orden.'}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    // Handle NaN or invalid values by returning 0
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '0';
    }
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy HH:mm', { locale: es });
  };

  const getPaymentMethodLabel = (method: string): string => {
    const methodLabels: Record<string, string> = {
      'cash': 'Efectivo',
      'bank_transfer': 'Transferencia bancaria',
      'ewallet': 'Billetera digital',
      'other': 'Otro'
    };
    return methodLabels[method] || method;
  };

  return (
    <div className="max-w-[80mm] mx-auto p-2 bg-white">
      {/* Debug section (only visible in non-print mode) */}
      <div className="print:hidden mb-4 p-2 bg-gray-100 rounded text-xs">
        <h3 className="font-bold">Información de diagnóstico (no se imprime)</h3>
        <p>ID de orden: {invoice.id}</p>
        <p>Número de orden: {invoice.orderNumber}</p>
        <p>Total de artículos: {invoice.items.length}</p>
        <p>Total de la orden: {formatCurrency(invoice.total)}</p>
        <p>Creada el: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString('es-DO') : 'No disponible'}</p>
        <p>Cliente: {invoice.customer?.name || 'No disponible'}</p>
        <div className="mt-2">
          <p className="font-semibold">Artículos:</p>
          <ul className="pl-4 list-disc">
            {invoice.items.map((item: OrderItem, idx: number) => (
              <li key={idx}>
                {item.serviceName} - {item.weightBased ? `${item.weight} kg` : `${item.quantity} artículos`} x {formatCurrency(item.price)} = {formatCurrency(item.subtotal)}
              </li>
            ))}
          </ul>
        </div>
        <button 
          onClick={() => window.print()} 
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
        >
          Imprimir ahora
        </button>
      </div>
      
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">FACTURA DE LAVANDERÍA</h1>
        <p className="text-xs text-gray-600">
          {invoice.createdAt ? formatDate(invoice.createdAt) : 'No disponible'}
        </p>
      </div>

      {/* Order and Customer Info */}
      <div className="mb-4">
        <div className="text-xs">
          <p>No: <strong>{invoice.orderNumber}</strong></p>
          <p>Fecha: {invoice.createdAt ? formatDate(invoice.createdAt) : 'No disponible'}</p>
          <p className="font-semibold">Cliente: {invoice.customer?.name || 'Cliente'}</p>
          {invoice.customer?.phone && <p>Tel.: {invoice.customer.phone}</p>}
          {invoice.customer?.address && <p className="whitespace-pre-wrap">Dirección: {invoice.customer.address}</p>}
        </div>
      </div>

      {/* Items Table - Ensure all items are displayed properly */}
      <table className="w-full mb-4 text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-1">Servicio</th>
            <th className="text-right py-1">Cant.</th>
            <th className="text-right py-1">Precio</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item: OrderItem, index: number) => {
              // For display purposes, show the correct unit price and quantity
              const isWeightBased = !!item.weightBased;
              const displayQuantity = isWeightBased 
                ? `${formatCurrency(Number(item.weight) || 0)} kg` 
                : formatCurrency(Number(item.quantity) || 0);
              
              return (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-1">{item.serviceName || 'Servicio'}</td>
                  <td className="text-right py-1">{displayQuantity}</td>
                  <td className="text-right py-1">{formatCurrency(Number(item.price) || 0)}</td>
                  <td className="text-right py-1">{formatCurrency(Number(item.subtotal) || 0)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="py-2 text-center text-gray-500">
                No hay artículos
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={3} className="py-2 text-right">Total:</td>
            <td className="py-2 text-right">{formatCurrency(invoice.total)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Payment Info if available */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-bold border-b border-gray-200 py-1">Información del pago</h3>
          <table className="w-full text-xs">
            <tbody>
              {invoice.payments.map((payment: any, index: number) => (
                <tr key={index}>
                  <td className="py-1">{getPaymentMethodLabel(payment.paymentMethod)}</td>
                  <td className="py-1 text-right">{formatCurrency(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes if any */}
      {invoice.notes && (
        <div className="mb-4">
          <h3 className="text-xs font-bold">Nota:</h3>
          <p className="text-xs whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs mt-8">
        <p>Gracias por confiar en nosotros.</p>
        <p>Conserva este comprobante.</p>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          
          .max-w-\\[80mm\\] {
            max-width: 80mm !important;
          }
          
          .p-2 {
            padding: 4px !important;
          }
        }
      `}</style>
    </div>
  );
} 