'use client';

import { useRouter } from 'next/navigation';
import OrderFlow from '@/components/orders/OrderFlow';

export default function OrderCreateDesktop() {
  const router = useRouter();
  
  const handleOrderComplete = (orderId: string) => {
    // After order is complete, navigate to the order detail page
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Crear una nueva orden</h1>
      <OrderFlow onComplete={handleOrderComplete} />
    </div>
  );
} 