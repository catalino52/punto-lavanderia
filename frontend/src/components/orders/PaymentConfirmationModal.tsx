import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Banknote, Building, QrCode } from "lucide-react";

interface PaymentData {
  amount: number;
  change: number;
  method: string;
  status: string;
  referenceNumber?: string;
}

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentData: PaymentData;
  orderTotal: number;
  isLoading: boolean;
}

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  paymentData,
  orderTotal,
  isLoading
}: PaymentConfirmationModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-5 w-5 text-green-500" />;
      case 'transfer':
        return <Building className="h-5 w-5 text-blue-500" />;
      case 'qris':
        return <QrCode className="h-5 w-5 text-purple-500" />;
      default:
        return <Banknote className="h-5 w-5 text-green-500" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'transfer':
        return 'Transferencia bancaria';
      case 'qris':
        return 'QRIS';
      default:
        return 'Efectivo';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Confirmar pago</DialogTitle>
          <DialogDescription className="text-center">
            Verifica que los datos del pago sean correctos antes de continuar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="font-medium text-blue-700">Total de la orden:</span>
            <span className="font-bold text-blue-800">RD$ {formatCurrency(orderTotal)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500">Método de pago</div>
              <div className="flex items-center mt-1">
                {getPaymentMethodIcon(paymentData.method)}
                <span className="ml-2 font-medium">{getPaymentMethodName(paymentData.method)}</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500">Monto pagado</div>
              <div className="font-medium mt-1">RD$ {formatCurrency(paymentData.amount)}</div>
            </div>
            
            {paymentData.change > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100 col-span-2">
                <div className="text-sm text-green-600">Cambio</div>
                <div className="font-medium mt-1 text-green-700">RD$ {formatCurrency(paymentData.change)}</div>
              </div>
            )}
            
            {paymentData.method !== 'cash' && paymentData.referenceNumber && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 col-span-2">
                <div className="text-sm text-purple-600">Nomor Referensi</div>
                <div className="font-medium mt-1 text-purple-700">{paymentData.referenceNumber}</div>
              </div>
            )}
            
            {/* Payment Status Indicator */}
            <div className={`p-3 rounded-lg border col-span-2 ${
              paymentData.status === 'completed' 
                ? 'bg-green-50 border-green-100' 
                : paymentData.status === 'pending'
                  ? 'bg-yellow-50 border-yellow-100'
                  : 'bg-gray-50 border-gray-100'
            }`}>
              <div className={`text-sm ${
                paymentData.status === 'completed' 
                  ? 'text-green-600' 
                  : paymentData.status === 'pending'
                    ? 'text-yellow-600'
                    : 'text-gray-600'
              }`}>Estado del pago</div>
              <div className={`font-medium mt-1 ${
                paymentData.status === 'completed' 
                  ? 'text-green-700' 
                  : paymentData.status === 'pending'
                    ? 'text-yellow-700'
                    : 'text-gray-700'
              }`}>
                {paymentData.status === 'completed' 
                  ? 'Completado'
                  : paymentData.status === 'pending'
                    ? 'Pendiente de confirmación'
                    : 'Sin procesar'}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button type="button" variant="outline" onClick={onClose} className="mt-3 sm:mt-0">
            <XCircle className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar pago
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 