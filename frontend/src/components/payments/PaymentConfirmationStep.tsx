'use client';

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { PaymentData } from './PaymentFlow';
import { PaymentMethod } from './PaymentForm';

interface PaymentConfirmationStepProps {
  paymentData: PaymentData;
  orderNumber: string;
  customerName: string;
  orderTotal: number;
  paidAmount: number;
  remainingAmount: number;
}

export default function PaymentConfirmationStep({
  paymentData,
  orderNumber,
  customerName,
  orderTotal,
  paidAmount,
  remainingAmount
}: PaymentConfirmationStepProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-DO').format(value);
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const methodLabels: Record<string, string> = {
      [PaymentMethod.CASH]: 'Efectivo',
      [PaymentMethod.CREDIT_CARD]: 'Tarjeta de crédito',
      [PaymentMethod.DEBIT_CARD]: 'Tarjeta de débito',
      [PaymentMethod.TRANSFER]: 'Transferencia bancaria',
      [PaymentMethod.EWALLET]: 'Billetera digital',
      [PaymentMethod.OTHER]: 'Otro'
    };
    return methodLabels[method] || method;
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Confirmar pago</h3>
      
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Orden</span>
              <span>{orderNumber}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cliente</span>
              <span>{customerName}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Método</span>
              <span>{getPaymentMethodLabel(paymentData.paymentMethod)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monto</span>
              <span className="font-medium">RD$ {formatCurrency(paymentData.amount)}</span>
            </div>
            
            {paymentData.paymentMethod !== PaymentMethod.CASH && paymentData.transactionId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID de transacción</span>
                <span>{paymentData.transactionId}</span>
              </div>
            )}
            
            {paymentData.amount > remainingAmount && (
              <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-md text-sm">
                Cambio: RD$ {formatCurrency(paymentData.amount - remainingAmount)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-primary/10 text-primary border-primary">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Haz clic en «Procesar pago» para completar la transacción.
        </AlertDescription>
      </Alert>
    </div>
  );
}